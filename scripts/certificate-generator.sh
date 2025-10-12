#!/bin/bash

# XiansAi Community Edition - Certificate Generation Functions
# This script contains functions for generating SSL certificates and related cryptographic operations

# Function to generate SSL certificate and return base64 encoded PFX
generate_ssl_certificate() {
    local password="$1"
    local output_dir="${2:-}"  # Optional: directory to save persistent CA files
    local temp_dir="./temp_cert_$$"
    mkdir -p "$temp_dir"
    
    echo "📜 Generating root CA certificate compatible with CertificateGenerator..." >&2
    
    # Root CA config with proper v3 extensions (UPDATED to match server expectations)
    cat > "$temp_dir/rootCA.conf" <<EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_ca
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = default
OU = admin
CN = XiansAi Root CA

[v3_ca]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical,CA:true
keyUsage = critical,digitalSignature,keyCertSign,cRLSign
EOF

    # Generate root CA key (encrypted with password)
    openssl genrsa -des3 -passout pass:"$password" -out "$temp_dir/rootCA.key" 4096
    
    # Generate root CA certificate with proper CA extensions
    openssl req -x509 -new -nodes -key "$temp_dir/rootCA.key" -sha256 -days 18250 \
        -config "$temp_dir/rootCA.conf" \
        -extensions v3_ca \
        -passin pass:"$password" \
        -out "$temp_dir/rootCA.crt" \
        -set_serial $(date -u +%s)
    
    echo "📜 Creating PFX with ONLY the root CA certificate and its private key..." >&2
    
    # CRITICAL FIX: Create PFX with ONLY the root CA certificate and its private key
    # This is what CertificateGenerator expects - a CA that can sign client certificates
    openssl pkcs12 -export \
        -out "$temp_dir/rootCA.pfx" \
        -inkey "$temp_dir/rootCA.key" \
        -in "$temp_dir/rootCA.crt" \
        -passin pass:"$password" \
        -passout pass:"$password" \
        -name "XiansAi Root CA"
    
    # Output base64 for .env usage
    if [ -f "$temp_dir/rootCA.pfx" ]; then
        echo "✅ Root CA certificate generated successfully" >&2
        
        # Verify the certificate has proper CA extensions
        echo "🔍 Verifying certificate extensions..." >&2
        openssl x509 -in "$temp_dir/rootCA.crt" -noout -text | grep -A5 "X509v3 Basic Constraints" >&2
        
        # Save to persistent location if output_dir is provided
        if [ -n "$output_dir" ]; then
            mkdir -p "$output_dir"
            cp "$temp_dir/rootCA.crt" "$output_dir/ca.crt"
            cp "$temp_dir/rootCA.key" "$output_dir/ca.key"
            cp "$temp_dir/rootCA.pfx" "$output_dir/ca.pfx"
            # Save password for signing derived certificates
            echo "$password" > "$output_dir/ca.password"
            chmod 600 "$output_dir/ca.password"
            echo "✅ CA certificates saved to $output_dir/" >&2
        fi
        
        cat "$temp_dir/rootCA.pfx" | base64 | tr -d '\n\r '
        rm -rf "$temp_dir"
    else
        echo "❌ Failed to generate certificate" >&2
        rm -rf "$temp_dir"
        return 1
    fi
}

# Function to generate server certificates separately (if needed for HTTPS)
generate_server_certificate() {
    local ca_cert_file="$1"  # Path to root CA certificate
    local ca_key_file="$2"   # Path to root CA private key
    local ca_password="$3"   # Password for CA private key
    local server_password="$4" # Password for server certificate
    local temp_dir="./temp_server_cert_$$"
    mkdir -p "$temp_dir"
    
    echo "📜 Generating server certificate for HTTPS..." >&2
    
    # Server config
    cat > "$temp_dir/server.conf" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = default
OU = admin
CN = XiansAi

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
EOF

    # Server extensions file for signing
    cat > "$temp_dir/server.ext" <<EOF
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
EOF

    # Generate server key + CSR
    openssl genrsa -out "$temp_dir/server.key" 2048
    openssl req -new -key "$temp_dir/server.key" \
        -out "$temp_dir/server.csr" \
        -config "$temp_dir/server.conf"
    
    # Sign server cert with root CA
    openssl x509 -req -in "$temp_dir/server.csr" \
        -CA "$ca_cert_file" -CAkey "$ca_key_file" -CAcreateserial \
        -out "$temp_dir/server.crt" -days 7300 -sha256 \
        -extfile "$temp_dir/server.ext" \
        -passin pass:"$ca_password"
    
    # Create server PFX
    openssl pkcs12 -export \
        -out "$temp_dir/server.pfx" \
        -inkey "$temp_dir/server.key" \
        -in "$temp_dir/server.crt" \
        -passout pass:"$server_password"
    
    # Output base64 for server certificate
    if [ -f "$temp_dir/server.pfx" ]; then
        cat "$temp_dir/server.pfx" | base64 | tr -d '\n\r '
        rm -rf "$temp_dir"
    else
        echo "❌ Failed to generate server certificate" >&2
        rm -rf "$temp_dir"
        return 1
    fi
}

# Generate server certificate with hostname/SAN
# Usage: generate_server_certificate <ca_dir> <output_dir> <cert_name> <hostname1> [hostname2] [hostname3]
generate_server_certificate() {
    local ca_dir="$1"
    local output_dir="$2"
    local cert_name="$3"
    shift 3
    local hostnames=("$@")
    
    echo "🔐 Generating server certificate: $cert_name" >&2
    echo "   SANs: ${hostnames[*]}" >&2
    
    local temp_dir="./temp_cert_$$"
    mkdir -p "$temp_dir"
    
    # Read CA password if it exists
    local ca_password=""
    if [ -f "$ca_dir/ca.password" ]; then
        ca_password=$(cat "$ca_dir/ca.password")
    fi
    
    # Server config with SANs
    cat > "$temp_dir/server.conf" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = XiansAi
OU = Services
CN = $cert_name

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
EOF
    
    # Add all hostnames as SAN
    local i=1
    for hostname in "${hostnames[@]}"; do
        echo "DNS.$i = $hostname" >> "$temp_dir/server.conf"
        ((i++))
    done
    
    # Generate server private key (no password)
    openssl genrsa -out "$temp_dir/server.key" 2048 2>&1 >&2
    
    # Generate CSR
    openssl req -new -key "$temp_dir/server.key" \
        -out "$temp_dir/server.csr" \
        -config "$temp_dir/server.conf" 2>&1 >&2
    
    # Sign with CA
    if [ -n "$ca_password" ]; then
        openssl x509 -req -in "$temp_dir/server.csr" \
            -CA "$ca_dir/ca.crt" \
            -CAkey "$ca_dir/ca.key" \
            -CAcreateserial \
            -out "$temp_dir/server.crt" \
            -days 825 \
            -sha256 \
            -extensions v3_req \
            -extfile "$temp_dir/server.conf" \
            -passin pass:"$ca_password" 2>&1 >&2
    else
        openssl x509 -req -in "$temp_dir/server.csr" \
            -CA "$ca_dir/ca.crt" \
            -CAkey "$ca_dir/ca.key" \
            -CAcreateserial \
            -out "$temp_dir/server.crt" \
            -days 825 \
            -sha256 \
            -extensions v3_req \
            -extfile "$temp_dir/server.conf" 2>&1 >&2
    fi
    
    if [ -f "$temp_dir/server.crt" ]; then
        mkdir -p "$output_dir"
        cp "$temp_dir/server.crt" "$output_dir/${cert_name}.crt"
        cp "$temp_dir/server.key" "$output_dir/${cert_name}.key"
        # Set permissions: readable by all (safe for Docker volumes, isolated from network)
        chmod 644 "$output_dir/${cert_name}.crt"
        chmod 644 "$output_dir/${cert_name}.key"
        echo "✅ Server certificate generated: $output_dir/${cert_name}.crt" >&2
        rm -rf "$temp_dir"
        return 0
    else
        echo "❌ Failed to generate server certificate" >&2
        rm -rf "$temp_dir"
        return 1
    fi
}

# Generate client certificate
# Usage: generate_client_certificate <ca_dir> <output_dir> <cert_name> <common_name>
generate_client_certificate() {
    local ca_dir="$1"
    local output_dir="$2"
    local cert_name="$3"
    local common_name="$4"
    
    echo "🔐 Generating client certificate: $cert_name" >&2
    echo "   CN: $common_name" >&2
    
    local temp_dir="./temp_cert_$$"
    mkdir -p "$temp_dir"
    
    # Read CA password if it exists
    local ca_password=""
    if [ -f "$ca_dir/ca.password" ]; then
        ca_password=$(cat "$ca_dir/ca.password")
    fi
    
    # Client config
    cat > "$temp_dir/client.conf" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = XiansAi
OU = Clients
CN = $common_name

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth
EOF
    
    # Generate client private key (no password)
    openssl genrsa -out "$temp_dir/client.key" 2048 2>&1 >&2
    
    # Generate CSR
    openssl req -new -key "$temp_dir/client.key" \
        -out "$temp_dir/client.csr" \
        -config "$temp_dir/client.conf" 2>&1 >&2
    
    # Sign with CA
    if [ -n "$ca_password" ]; then
        openssl x509 -req -in "$temp_dir/client.csr" \
            -CA "$ca_dir/ca.crt" \
            -CAkey "$ca_dir/ca.key" \
            -CAcreateserial \
            -out "$temp_dir/client.crt" \
            -days 825 \
            -sha256 \
            -extensions v3_req \
            -extfile "$temp_dir/client.conf" \
            -passin pass:"$ca_password" 2>&1 >&2
    else
        openssl x509 -req -in "$temp_dir/client.csr" \
            -CA "$ca_dir/ca.crt" \
            -CAkey "$ca_dir/ca.key" \
            -CAcreateserial \
            -out "$temp_dir/client.crt" \
            -days 825 \
            -sha256 \
            -extensions v3_req \
            -extfile "$temp_dir/client.conf" 2>&1 >&2
    fi
    
    if [ -f "$temp_dir/client.crt" ]; then
        mkdir -p "$output_dir"
        cp "$temp_dir/client.crt" "$output_dir/${cert_name}.crt"
        cp "$temp_dir/client.key" "$output_dir/${cert_name}.key"
        # Set permissions: readable by all (safe for Docker volumes, isolated from network)
        chmod 644 "$output_dir/${cert_name}.crt"
        chmod 644 "$output_dir/${cert_name}.key"
        echo "✅ Client certificate generated: $output_dir/${cert_name}.crt" >&2
        rm -rf "$temp_dir"
        return 0
    else
        echo "❌ Failed to generate client certificate" >&2
        rm -rf "$temp_dir"
        return 1
    fi
}
