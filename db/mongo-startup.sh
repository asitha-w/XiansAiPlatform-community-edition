#!/bin/bash

# MongoDB Startup Script with Automatic Replica Set Initialization
# This script ensures replica set is properly configured every time

set -e

echo "[MongoDB-Startup] Starting MongoDB with replica set initialization..."

# Start MongoDB in the background
mongod --replSet rs0 --bind_ip_all --fork --logpath /var/log/mongodb.log

# Wait for MongoDB to be ready
echo "[MongoDB-Startup] Waiting for MongoDB to be ready..."
until mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "[MongoDB-Startup] Waiting for MongoDB to start..."
  sleep 2
done

echo "[MongoDB-Startup] MongoDB is ready, checking replica set status..."

# Check if replica set is already configured
if mongosh --eval "rs.status()" > /dev/null 2>&1; then
  echo "[MongoDB-Startup] ✅ Replica set already configured"
else
  echo "[MongoDB-Startup] Initializing replica set..."
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
  
  # Wait for replica set to be ready
  echo "[MongoDB-Startup] Waiting for replica set to be ready..."
  until mongosh --eval "rs.status().members[0].stateStr" 2>/dev/null | grep -q "PRIMARY"; do
    echo "[MongoDB-Startup] Waiting for replica set to become PRIMARY..."
    sleep 2
  done
  
  echo "[MongoDB-Startup] ✅ Replica set initialized successfully"
fi

echo "[MongoDB-Startup] ✅ MongoDB startup complete - switching to foreground mode"

# Stop the background MongoDB and start in foreground
mongod --shutdown
exec mongod --replSet rs0 --bind_ip_all 