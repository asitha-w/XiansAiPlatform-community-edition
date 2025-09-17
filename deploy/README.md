# Deployment

1. ssh to the VM machine

```bash
ssh username@172.191.111.122
```

1. Clone the repository

```bash

git clone https://github.com/XiansAiPlatform/community-edition

```

1. Change the nginx configuration with host name

```bash

cd deploy/nginx
cp .env.example .env
vi .env
# change  DOMAIN=prod.xiansai.net to the domain name assigned to this vm
# DNS   A   *prod.xiansai.net   <vm's ip>
```

1. Setup https with a new certificate

```bash
cd deploy/nginx
./setup-production-https.sh

```

1. Configure xians deployment

```bash

cd .env.sample .env
vi .env
# Change the befolow configuration. For example
# XIANSUI_HOST=prod.xiansai.net
# XIANSAPI_HOST=api.prod.xiansai.net
# TEMPORAL_HOST=temporal.prod.xiansai.net
# KEYCLOAK_HOST=auth.prod.xiansai.net
```

1. Start the xians

```bash
./start-all.sh
```
