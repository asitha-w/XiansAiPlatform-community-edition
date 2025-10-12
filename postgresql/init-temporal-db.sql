-- Initialize Temporal databases
-- This script creates the required databases for Temporal workflow engine
-- It runs automatically when PostgreSQL container starts for the first time

-- Create the main Temporal database if it doesn't exist
SELECT 'CREATE DATABASE temporal'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'temporal')\gexec

-- Create the Temporal visibility database if it doesn't exist
SELECT 'CREATE DATABASE temporal_visibility'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'temporal_visibility')\gexec

-- Log completion
\echo 'Temporal databases initialized successfully'

