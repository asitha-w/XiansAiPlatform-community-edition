-- Create Keycloak database and user
-- This script runs automatically when PostgreSQL container starts for the first time

-- Create user for Keycloak (using the same dbuser for both Keycloak and Temporal)
-- Note: The dbuser is already created by PostgreSQL with POSTGRES_USER/POSTGRES_PASSWORD

-- Create Keycloak database owned by dbuser
CREATE DATABASE keycloak OWNER dbuser;

-- Grant privileges to dbuser for Keycloak database
GRANT ALL PRIVILEGES ON DATABASE keycloak TO dbuser; 