# Dual-Purpose Certificate Architecture

## Overview

All service certificates in this deployment are **dual-purpose**: they support both server authentication (`serverAuth`) and client authentication (`clientAuth`). This simplifies certificate management while maintaining security.

## Why Dual-Purpose?

Many services in our architecture play **both roles**:

1. **Temporal Server**
   - 🖥️ **Server**: Accepts connections from UI, SDK, tctl (port 7233)
   - 🔌 **Client**: Internal services (Worker, History, Matching) connect to each other

2. **XiansAI Server**
   - 🖥️ **Server**: Serves HTTPS for UI and API (port 5001)
   - 🔌 **Client**: Connects to Temporal as a workflow client

3. **Temporal UI**
   - 🖥️ **Server**: Serves web interface (port 8080)
   - 🔌 **Client**: Connects to Temporal server

## Certificate Generation

### Function: `generate_service_certificate`

**Location**: `scripts/certificate-generator.sh`

**Signature**:
```bash
generate_service_certificate <ca_dir> <output_dir> <cert_name> <hostname1> [hostname2] ...
```

**Generates**:
- Certificate with both `serverAuth` and `clientAuth` in Extended Key Usage
- Subject Alternative Names (SANs) for all provided hostnames
- 2048-bit RSA key pair
- Valid for 825 days

**Example**:
```bash
generate_service_certificate "./tmp/certs" "./temporal/certs" "temporal" "temporal" "localhost"
```

## Certificate Properties

### Extended Key Usage
```
X509v3 Extended Key Usage:
    TLS Web Server Authentication, TLS Web Client Authentication
```

### Key Usage
```
X509v3 Key Usage:
    Digital Signature, Non Repudiation, Key Encipherment
```

### Subject Alternative Names (Example: temporal.crt)
```
X509v3 Subject Alternative Name:
    DNS:temporal, DNS:localhost
```

## Generated Certificates

| Certificate | Service | Purpose | Key Usage |
|-------------|---------|---------|-----------|
| `ca.crt` / `ca.pfx` | Root CA | Signs all certificates | CA |
| `temporal.crt` | Temporal Server | Server + Client (internal) | serverAuth, clientAuth |
| `temporal-ui.crt` | Temporal UI | Server + Client | serverAuth, clientAuth |
| `server.pfx` (XiansAI) | XiansAI Server | HTTPS Server + Temporal Client | serverAuth, clientAuth |

## Benefits

✅ **Simplified Management**: One certificate per service  
✅ **Flexibility**: Service can act as both server and client  
✅ **Security**: mTLS enforced for all connections  
✅ **Consistency**: Same pattern across all services  
✅ **Future-Proof**: Easy to add new services following same pattern

## Verification

### Check Certificate Type
```bash
# Check Extended Key Usage
openssl x509 -in temporal/certs/temporal.crt -text -noout | grep -A 3 "Extended Key Usage"

# Expected output:
# X509v3 Extended Key Usage:
#     TLS Web Server Authentication, TLS Web Client Authentication
```

### Check Subject Alternative Names
```bash
openssl x509 -in temporal/certs/temporal.crt -text -noout | grep -A 3 "Subject Alternative Name"

# Expected output:
# X509v3 Subject Alternative Name:
#     DNS:temporal, DNS:localhost
```

## Migration Notes

**From**: Separate `generate_server_certificate` and `generate_client_certificate` functions  
**To**: Single `generate_service_certificate` function with dual-purpose certificates

**Changed Files**:
- `scripts/certificate-generator.sh` - Unified certificate generation
- `scripts/create-secrets.sh` - Updated to use new function
- All certificates now have both `serverAuth` and `clientAuth`

## Security Considerations

1. **Least Privilege**: While certificates support both roles, each service only uses what it needs
2. **CA Trust**: All certificates signed by same CA establishes trust domain
3. **Hostname Validation**: SANs ensure proper hostname validation for server role
4. **mTLS**: Client role enables mutual authentication

## Related Documentation

- [TLS_CONFIGURATION.md](TLS_CONFIGURATION.md) - TLS/mTLS setup details
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - General setup guide
- [../scripts/MTLS_SETUP.md](../../scripts/MTLS_SETUP.md) - Certificate generation details
