#!/bin/bash

# MongoDB Startup Script with Authentication and Replica Set Initialization
# This script ensures replica set is properly configured with authentication every time

set -e

echo "[MongoDB-Startup] Starting MongoDB with authentication and replica set initialization..."

# Get environment variables with defaults
MONGO_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME:-xiansai_admin}
MONGO_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
MONGO_APP_USERNAME=${MONGO_APP_USERNAME:-xiansai_app}
MONGO_APP_PASSWORD=${MONGO_APP_PASSWORD}
MONGO_DB_NAME=${MONGO_DB_NAME:-xians}

echo "[MongoDB-Startup] Environment variables:"
echo "  MONGO_ROOT_USERNAME: $MONGO_ROOT_USERNAME"
echo "  MONGO_ROOT_PASSWORD: [${#MONGO_ROOT_PASSWORD} chars]"
echo "  MONGO_APP_USERNAME: $MONGO_APP_USERNAME"
echo "  MONGO_APP_PASSWORD: [${#MONGO_APP_PASSWORD} chars]"
echo "  MONGO_DB_NAME: $MONGO_DB_NAME"

# Check if this is first run (no auth setup yet) - BEFORE keyFile creation
FIRST_RUN=false
if [ ! -f /data/db/.mongodb_auth_configured ]; then
  FIRST_RUN=true
  echo "[MongoDB-Startup] First run detected - will configure authentication"
else
  # Check if credentials have changed by comparing with stored credentials
  STORED_CREDS=""
  if [ -f /data/db/.mongodb_credentials ]; then
    STORED_CREDS=$(cat /data/db/.mongodb_credentials)
  fi
  
  CURRENT_CREDS="${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}:${MONGO_APP_USERNAME}:${MONGO_APP_PASSWORD}"
  
  if [ "$STORED_CREDS" != "$CURRENT_CREDS" ]; then
    echo "[MongoDB-Startup] Credentials changed - reconfiguring authentication"
    FIRST_RUN=true
    rm -f /data/db/.mongodb_auth_configured
  else
    echo "[MongoDB-Startup] Subsequent run - authentication already configured"
  fi
fi

# Create keyFile for replica set authentication (only if it doesn't exist)
if [ ! -f /data/db/mongodb-keyfile ]; then
  echo "[MongoDB-Startup] Creating keyFile for replica set authentication..."
  KEYFILE_CONTENT=$(openssl rand -base64 756)
  echo "$KEYFILE_CONTENT" > /data/db/mongodb-keyfile
  chmod 400 /data/db/mongodb-keyfile
  chown mongodb:mongodb /data/db/mongodb-keyfile
  echo "[MongoDB-Startup] ✅ KeyFile created"
else
  echo "[MongoDB-Startup] ✅ KeyFile already exists"
fi

# Start MongoDB in the background
if [ "$FIRST_RUN" = true ]; then
  # First run: start WITHOUT keyFile to avoid authentication requirement for replica set init
  mongod --replSet rs0 --bind_ip_all --fork --logpath /var/log/mongodb.log
else
  # Subsequent runs: start with auth and keyFile
  mongod --replSet rs0 --bind_ip_all --auth --keyFile /data/db/mongodb-keyfile --fork --logpath /var/log/mongodb.log
fi

# Wait for MongoDB to be ready
echo "[MongoDB-Startup] Waiting for MongoDB to be ready..."
until mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "[MongoDB-Startup] Waiting for MongoDB to start..."
  sleep 2
done

echo "[MongoDB-Startup] MongoDB is ready..."

# STEP 1: Initialize replica set FIRST (required before creating users)
echo "[MongoDB-Startup] Checking replica set status..."

# Check if replica set exists and is PRIMARY
RS_PRIMARY=false
if [ "$FIRST_RUN" = true ]; then
  # Check if replica set is configured AND primary
  echo "[MongoDB-Startup] Checking replica set status without authentication..."
  RS_STATE=$(mongosh --eval "try { print(rs.status().members[0].stateStr); } catch(e) { print('not_configured'); }" --quiet 2>/dev/null)
else
  echo "[MongoDB-Startup] Checking replica set status with authentication..."
  # Try with authentication
  RS_STATE=$(mongosh --username "${MONGO_ROOT_USERNAME}" --password "${MONGO_ROOT_PASSWORD}" --authenticationDatabase admin --eval "try { print(rs.status().members[0].stateStr); } catch(e) { print('not_configured'); }" --quiet 2>/dev/null)
  
  # If authentication fails or returns empty, try without authentication
  if [[ -z "$RS_STATE" ]]; then
    echo "[MongoDB-Startup] Authentication failed or empty response, trying without authentication..."
    RS_STATE=$(mongosh --eval "try { print(rs.status().members[0].stateStr); } catch(e) { print('not_configured'); }" --quiet 2>/dev/null || echo "not_configured")
  fi
fi

echo "[MongoDB-Startup] Replica set state: '$RS_STATE'"

if [[ "$RS_STATE" == "PRIMARY" ]]; then
  echo "[MongoDB-Startup] ✅ Replica set already configured and PRIMARY"
  RS_PRIMARY=true
elif [[ "$RS_STATE" == *"not_configured"* ]]; then
  echo "[MongoDB-Startup] Initializing replica set..."
  if [ "$FIRST_RUN" = true ]; then
    mongosh --eval "
      rs.initiate({
        _id: 'rs0',
        members: [
          {
            _id: 0,
            host: 'mongodb:27017'
          }
        ]
      })
    "
  else
    mongosh --username "${MONGO_ROOT_USERNAME}" --password "${MONGO_ROOT_PASSWORD}" --authenticationDatabase admin --eval "
      rs.initiate({
        _id: 'rs0',
        members: [
          {
            _id: 0,
            host: 'mongodb:27017'
          }
        ]
      })
    "
  fi
else
  echo "[MongoDB-Startup] Replica set exists but not PRIMARY (state: $RS_STATE), waiting..."
fi

# Always wait for PRIMARY state before proceeding
if [ "$RS_PRIMARY" = false ]; then
  echo "[MongoDB-Startup] Waiting for replica set to be ready..."
  if [ "$FIRST_RUN" = true ]; then
    until mongosh --eval "rs.status().members[0].stateStr" 2>/dev/null | grep -q "PRIMARY"; do
      echo "[MongoDB-Startup] Waiting for replica set to become PRIMARY..."
      sleep 2
    done
  else
    until mongosh --username "${MONGO_ROOT_USERNAME}" --password "${MONGO_ROOT_PASSWORD}" --authenticationDatabase admin --eval "rs.status().members[0].stateStr" 2>/dev/null | grep -q "PRIMARY"; do
      echo "[MongoDB-Startup] Waiting for replica set to become PRIMARY..."
      sleep 2
    done
  fi
  
  echo "[MongoDB-Startup] ✅ Replica set is now PRIMARY"
fi

# STEP 2: Configure authentication AFTER replica set is PRIMARY
if [ "$FIRST_RUN" = true ]; then
  echo "[MongoDB-Startup] Setting up authentication..."
  
  # Create or update admin user
  mongosh admin --eval "
    try {
      db.createUser({
        user: '${MONGO_ROOT_USERNAME}',
        pwd: '${MONGO_ROOT_PASSWORD}',
        roles: ['root']
      });
      print('Admin user created successfully');
    } catch (e) {
      if (e.message.includes('already exists')) {
        db.updateUser('${MONGO_ROOT_USERNAME}', {
          pwd: '${MONGO_ROOT_PASSWORD}',
          roles: ['root']
        });
        print('Admin user updated successfully');
      } else {
        throw e;
      }
    }
  "
  
  # Create or update application user
  mongosh ${MONGO_DB_NAME} --eval "
    try {
      db.createUser({
        user: '${MONGO_APP_USERNAME}',
        pwd: '${MONGO_APP_PASSWORD}',
        roles: [
          { role: 'readWrite', db: '${MONGO_DB_NAME}' }
        ]
      });
      print('Application user created successfully');
    } catch (e) {
      if (e.message.includes('already exists')) {
        db.updateUser('${MONGO_APP_USERNAME}', {
          pwd: '${MONGO_APP_PASSWORD}',
          roles: [
            { role: 'readWrite', db: '${MONGO_DB_NAME}' }
          ]
        });
        print('Application user updated successfully');
      } else {
        throw e;
      }
    }
  "
  
  # Mark authentication as configured and store credentials
  touch /data/db/.mongodb_auth_configured
  echo "${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}:${MONGO_APP_USERNAME}:${MONGO_APP_PASSWORD}" > /data/db/.mongodb_credentials
  echo "[MongoDB-Startup] ✅ Authentication configured successfully"
fi

echo "[MongoDB-Startup] ✅ MongoDB startup complete - switching to foreground mode"

# Stop the background MongoDB and start in foreground with auth and keyFile
mongod --shutdown

# Always use auth and keyFile for the final startup (authentication is now configured)
exec mongod --replSet rs0 --bind_ip_all --auth --keyFile /data/db/mongodb-keyfile 