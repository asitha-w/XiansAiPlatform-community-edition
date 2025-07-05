# PostgreSQL Service

This directory contains the PostgreSQL database service that can be shared across multiple services in the Flowmaxer community edition.

## Usage

To start the PostgreSQL service:

```bash
cd postgresql
docker-compose up -d
```

To stop the PostgreSQL service:

```bash
cd postgresql
docker-compose down
```

## Configuration

The PostgreSQL service is configured with:

- **Database User**: `temporal`
- **Database Password**: `temporal`
- **Port**: `5432`
- **Container Name**: `postgresql${ENVIRONMENT_SUFFIX:-}`
- **Volume**: `postgresql-data${ENVIRONMENT_SUFFIX:-}`

## Network

The service connects to the `xians-community-edition-network${ENVIRONMENT_SUFFIX:-}` network, allowing other services to access it using the container name `postgresql`.

## Dependencies

Other services can connect to this PostgreSQL instance by:

1. Ensuring they're on the same network (`xians-community-edition`)
2. Using `postgresql` as the hostname
3. Using port `5432`
4. Using the credentials specified above

## Environment Variables

The following environment variables are supported:

- `ENVIRONMENT_SUFFIX`: Optional suffix for container and volume names
- `POSTGRESQL_VERSION`: PostgreSQL Docker image version tag 