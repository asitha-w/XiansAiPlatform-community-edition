-- Create Keycloak database and user
-- This script runs automatically when PostgreSQL container starts for the first time

-- Create user for Keycloak
CREATE USER keycloak WITH PASSWORD 'temporal';

-- Create Keycloak database  
CREATE DATABASE keycloak OWNER keycloak;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak; 