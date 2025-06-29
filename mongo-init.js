// MongoDB Initialization Script for Production
// This script runs once during container initialization

function log(message) {
    print(`[MongoDB-Init] ${new Date().toISOString()}: ${message}`);
}

function initializeReplicaSet() {
    try {
        log("Initializing replica set for production...");
        
        const result = rs.initiate({
            _id: "rs0",
            members: [
                {
                    _id: 0,
                    host: "mongodb:27017"
                }
            ]
        });
        
        if (result.ok === 1) {
            log("✅ Replica set initialized successfully");
            return true;
        } else {
            log(`❌ Replica set initialization failed: ${JSON.stringify(result)}`);
            return false;
        }
    } catch (error) {
        if (error.message.includes("already initialized")) {
            log("✅ Replica set already initialized");
            return true;
        } else {
            log(`❌ Error initializing replica set: ${error.message}`);
            return false;
        }
    }
}

// Main initialization logic
log("Starting MongoDB initialization...");

try {
    // Test database connectivity
    db.adminCommand('ping');
    log("✅ MongoDB is responsive");
    
    // Initialize replica set
    initializeReplicaSet();
    
    log("✅ MongoDB initialization completed");
} catch (error) {
    log(`❌ MongoDB initialization failed: ${error.message}`);
} 