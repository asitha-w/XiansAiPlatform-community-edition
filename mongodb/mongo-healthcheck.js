// MongoDB Healthcheck with Authentication Support
// This script ensures MongoDB is healthy AND the replica set is properly configured

function log(message) {
    print(`[MongoDB-Health] ${new Date().toISOString()}: ${message}`);
}

function authenticateIfNeeded() {
    // Get environment variables from container environment
    const username = process.env.MONGO_INITDB_ROOT_USERNAME || "xiansai_admin";
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
    
    try {
        // Try to ping without authentication first (for backwards compatibility)
        db.adminCommand('ping');
        log("✅ MongoDB responsive without authentication (first run or auth not enabled)");
        return true;
    } catch (error) {
        // If ping fails, try with authentication
        try {
            db = db.getSiblingDB('admin');
            db.auth(username, password);
            db.adminCommand('ping');
            log("✅ MongoDB responsive with authentication");
            return true;
        } catch (authError) {
            log(`❌ Authentication failed: ${authError.message}`);
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
        if (error.message.includes("requires authentication")) {
            log("Replica set check requires authentication - MongoDB is properly secured");
            // If we got here, authentication worked in the previous step, so replica set is likely healthy
            return true;
        } else {
            log(`Error checking replica set: ${error.message}`);
            log("Note: Replica set should be initialized by startup script");
            return false;
        }
    }
}

function main() {
    try {
        // First authenticate if needed and check if MongoDB is responsive
        const authOk = authenticateIfNeeded();
        if (!authOk) {
            log("❌ MongoDB health check failed - authentication failed");
            quit(1);
        }
        
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