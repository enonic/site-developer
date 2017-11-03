// Includes.
var docLib = require('/lib/doc');

// Do search request.
exports.get = function(req) {
    var result = docLib.search(req.params.q, req.params.start, req.params.count);


    return {
        contentType: 'text/json',
        body: result
    };

};
