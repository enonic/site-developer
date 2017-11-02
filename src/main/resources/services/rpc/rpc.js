// Includes.
var syncLib = require('/lib/sync');

// Variables.
var authKey = app.config.rpcAuthKey;
var allowedIps = app.config.rpcAllowedIps || '127.0.0.1';

// Check auth key.
function checkAuthKey(key) {
    return (key && authKey && key.equals(authKey));
}

// Check IP restrictions.
function checkIpRestriction(ip) {
    return allowedIps.contains(ip);
}

// Check security.
function checkSecurity(req) {
    return checkAuthKey(req.headers['X-AuthKey']) && checkIpRestriction(req.remoteAddress);
}

// Create error JSON.
function error(code, message) {
    return {
        status: code,
        body: {
            error: message
        },
        contentType: 'application/json'
    };
}

// OK response.
function ok(body) {
    return {
        status: 200,
        body: body,
        contentType: 'application/json'
    };
}

// List entries.
function listEntries() {
    return ok({
        keys: syncLib.findAllEntries()
    });
}

// Delete entry.
function deleteEntry(json) {
    syncLib.deleteEntry(json.key);
    return ok({});
}

// Update entry.
function updateEntry(json) {
    var entry = json.entry;
    entry.doc = json.doc;

    syncLib.updateEntry(entry);
    return ok({});
}

// Handle RPC post.
exports.post = function (req) {
    // Check auth key.
    if (!checkSecurity(req)) {
        return error(400, 'Access denied');
    }

    // Check if content type JSON.
    if (!req.contentType.startsWith('application/json')) {
        return error(400, 'Illegal request body');
    }

    // Parse JSON
    var json = JSON.parse(req.body);

    // Execute listAll if right operation.
    if (json.operation === 'listAll') {
        return listEntries();
    }

    // Execute delete if right operation.
    if (json.operation === 'delete') {
        return deleteEntry(json);
    }

    // Execute update if right operation.
    if (json.operation === 'update') {
        return updateEntry(json);
    }

    // Return error.
    return error(400, 'No such operation');
};
