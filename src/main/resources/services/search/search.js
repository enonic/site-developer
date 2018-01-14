// Includes.
var libs = {
  ct: require('/content-types')
  d: require('/lib/doc');
};

// Imported constants and functions
var RT_JSON = libs.ct.RT_JSON;
var searchDocs = libs.d.search;

// Do search request.
exports.get = function(req) {
    return {
        contentType: RT_JSON,
        body: searchDocs(
          req.params.q,
          req.params.path,
          req.params.start,
          req.params.count
        )
    }; // return
}; // exports.get
