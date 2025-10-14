# Temporal mTLS Configuration (Production)

This guide explains how to enable and verify full mTLS for `temporalio/server`, why customizing the config template may be necessary, and the exact changes required.

## Part 1 — Goal and what enabling mTLS does

- **Goal**: Encrypt all Temporal traffic and require mutual authentication for every client (external SDKs/CLI/UI) and internal service (history, matching, internal-frontend).
- **Effect of `TEMPORAL_TLS_REQUIRE_CLIENT_AUTH=true`**: Frontend and Internode servers require client certificates signed by the trusted CA. Any client without a valid cert is rejected during TLS handshake.
- **Certificates**: Generate dual-purpose certificates (serverAuth + clientAuth) so services that act as both server and client can use the same certificate when appropriate.

## Part 2 — Challenge with the community image and resolution

### 2.a The challenge

- The `temporalio/server` image renders its runtime config from `config_template.yaml` using a templating step (dockerize). Only common settings are directly exposed as env vars.
- The stock template does not provide client cert fields under internal TLS clients (e.g., `global.tls.internode.client`, `global.tls.frontend.client`). With `requireClientAuth` enabled, internal dials need client certs — otherwise internode handshakes fail.

### 2.b Resolution

- Mount a custom `temporal/config/config_template.yaml` so the container generates `docker.yaml` from that template plus env vars.
- Upstream reference template: [config_template.yaml@v1.28.0](https://github.com/temporalio/temporal/blob/v1.28.0/docker/config_template.yaml)
- Exact edits to add (client certs for internal clients):

```211:215:/home/asithaw/work/000_agent_training/git-forked/XiansAiPlatform-community-edition/temporal/config/config_template.yaml
                # Client certificate for mTLS (internode authentication)
                certFile: {{ default .Env.TEMPORAL_TLS_INTERNODE_CLIENT_CERT "" }}
                keyFile: {{ default .Env.TEMPORAL_TLS_INTERNODE_CLIENT_KEY "" }}
                certData: {{ default .Env.TEMPORAL_TLS_INTERNODE_CLIENT_CERT_DATA "" }}
                keyData: {{ default .Env.TEMPORAL_TLS_INTERNODE_CLIENT_KEY_DATA "" }}
```

```250:254:/home/asithaw/work/000_agent_training/git-forked/XiansAiPlatform-community-edition/temporal/config/config_template.yaml
                # Client certificate for mTLS (worker authentication)
                certFile: {{ default .Env.TEMPORAL_TLS_WORKER_CLIENT_CERT "" }}
                keyFile: {{ default .Env.TEMPORAL_TLS_WORKER_CLIENT_KEY "" }}
                certData: {{ default .Env.TEMPORAL_TLS_WORKER_CLIENT_CERT_DATA "" }}
                keyData: {{ default .Env.TEMPORAL_TLS_WORKER_CLIENT_KEY_DATA "" }}
```

- Additional references:
  - Configuration reference: [docs.temporal.io/references/configuration](https://docs.temporal.io/references/configuration)

### 2.b.1 Step-by-step (copy/paste)

1) Generate certificates (dual-purpose)
```bash
./scripts/create-secrets.sh
# certs will be under temporal/certs/
```

2) Ensure the custom template exists
- File: `temporal/config/config_template.yaml`
- Confirm the two client cert blocks shown above exist (internode.client and frontend.client).

3) Minimal docker-compose changes (Temporal service)
```yaml
temporal:
  hostname: temporal
  image: temporalio/server:${TEMPORAL_VERSION}
  environment:
    - TEMPORAL_TLS_REQUIRE_CLIENT_AUTH=true
    - TEMPORAL_TLS_SERVER_CERT=/etc/temporal/certs/temporal.crt
    - TEMPORAL_TLS_SERVER_KEY=/etc/temporal/certs/temporal.key
    - TEMPORAL_TLS_SERVER_CA_CERT=/etc/temporal/certs/ca.crt
    - TEMPORAL_TLS_FRONTEND_CERT=/etc/temporal/certs/temporal.crt
    - TEMPORAL_TLS_FRONTEND_KEY=/etc/temporal/certs/temporal.key
    - TEMPORAL_TLS_FRONTEND_SERVER_NAME=temporal
    - TEMPORAL_TLS_INTERNODE_SERVER_NAME=temporal
    # Client certs for internal clients (mTLS)
    - TEMPORAL_TLS_INTERNODE_CLIENT_CERT=/etc/temporal/certs/temporal.crt
    - TEMPORAL_TLS_INTERNODE_CLIENT_KEY=/etc/temporal/certs/temporal.key
    - TEMPORAL_TLS_WORKER_CLIENT_CERT=/etc/temporal/certs/temporal.crt
    - TEMPORAL_TLS_WORKER_CLIENT_KEY=/etc/temporal/certs/temporal.key
  volumes:
    - ./temporal/certs:/etc/temporal/certs:ro
    - ./temporal/config/config_template.yaml:/etc/temporal/config/config_template.yaml:ro
```

4) Restart Temporal
```bash
docker compose -f temporal/docker-compose.yml up -d --build temporal
```

### 2.c Current mTLS coverage after these changes

- **Frontend (server-side)**: Presents `temporal.crt`, requires client auth. All external clients (SDKs, `tctl`, UI, XiansAI server) must present valid client certs and trust the CA.
- **Frontend (internal client-side)**: Temporal Worker role dials Frontend with a client cert.
- **Internode (server-side)**: History/Matching/Internal-Frontend present `temporal.crt`, require client auth.
- **Internode (client-side)**: Internal services dial each other with client certs.
- **Temporal UI/admin-tools (`tctl`)**: Use client certs to connect to Frontend.

Result: All Temporal RPC paths (external and internal) are protected by mTLS.

## Part 3 — How to test mTLS

- Negative test (should fail without client cert):
```bash
docker exec temporal tctl --address temporal:7233 cluster health
```

- Positive test with client cert:
```bash
docker exec temporal tctl \
  --address temporal:7233 \
  --tls_cert_path /etc/temporal/certs/temporal-ui.crt \
  --tls_key_path /etc/temporal/certs/temporal-ui.key \
  --tls_ca_path /etc/temporal/certs/ca.crt \
  cluster health
```

- Hostname/SNI: Set the service `hostname: temporal` and `serverName=temporal` to ensure SAN validation.
- Logs: Inspect Temporal logs for TLS initialization and absence of "bad certificate" errors after configuration.
- Internode: Ensure History/Matching/Frontend start without internode TLS handshake errors.

---

References
- Upstream template: [temporal/docker/config_template.yaml@v1.28.0](https://github.com/temporalio/temporal/blob/v1.28.0/docker/config_template.yaml)
- Configuration reference: [docs.temporal.io/references/configuration](https://docs.temporal.io/references/configuration)

