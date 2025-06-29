// MongoDB Healthcheck and Replica Set Initialization Script
// This script ensures MongoDB is healthy AND the replica set is properly configured

function log(message) {
    print(`[MongoDB-Health] ${new Date().toISOString()}: ${message}`);
}

function initializeReplicaSet() {
    try {
        log("Attempting to initialize replica set...");
        
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

function checkReplicaSetStatus() {
    try {
        const status = rs.status();
        if (status.members && status.members.length > 0) {
            const member = status.members[0];
            log(`Replica set status: ${member.stateStr} (${member.name})`);
            
            // Check if member is PRIMARY or SECONDARY (healthy states)
            if (member.stateStr === "PRIMARY" || member.stateStr === "SECONDARY") {
                return true;
            } else if (member.stateStr === "STARTUP" || member.stateStr === "STARTUP2") {
                log("Replica set member is starting up, waiting...");
                return false;
            } else {
                log(`Replica set in problematic state: ${member.stateStr}`);
                return false;
            }
        }
        return false;
    } catch (error) {
        log(`Error checking replica set: ${error.message}`);
        log("Note: Replica set should be initialized by startup script");
        return false;
    }
}

function main() {
    try {
        // First check if MongoDB itself is responsive
        db.adminCommand('ping');
        log("✅ MongoDB is responsive");
        
        // Then check/ensure replica set is properly configured
        const replicaSetOk = checkReplicaSetStatus();
        
        if (replicaSetOk) {
            log("✅ MongoDB health check passed - database responsive and replica set healthy");
            // Exit successfully
            quit(0);
        } else {
            log("❌ MongoDB health check failed - replica set not healthy");
            // Exit with error
            quit(1);
        }
    } catch (error) {
        log(`❌ MongoDB health check failed: ${error.message}`);
        quit(1);
    }
}

// Run the main function
main(); 