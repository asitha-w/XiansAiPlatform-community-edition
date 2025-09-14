-- Create Keycloak database and user
-- This script runs automatically when PostgreSQL container starts for the first time

-- Create user for Keycloak (using the same temporal user for both Keycloak and Temporal)
-- Note: The temporal user is already created by PostgreSQL with POSTGRES_USER/POSTGRES_PASSWORD

-- Create Keycloak database owned by temporal user
CREATE DATABASE keycloak OWNER temporal;

-- Grant privileges to temporal user for Keycloak database
GRANT ALL PRIVILEGES ON DATABASE keycloak TO temporal; 