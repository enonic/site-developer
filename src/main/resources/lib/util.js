var libs = {
    c: require('/lib/xp/content'),
    p: require('/lib/xp/portal'),
    q: require('/lib/query')
};

// Imported functions
var getSite = libs.p.getSite;
var pageUrl = libs.p.pageUrl;
var query = libs.c.query;

// query functions
var and       = libs.q.and;
var pathMatch = libs.q.pathMatch;
var propEq    = libs.q.propEq;


exports.getSiteUrl = function() {
    var sitePath = getSite()._path;
    var baseUrl = pageUrl({
        path: sitePath
    });

    if (baseUrl.slice(-1) != '/') {
        return baseUrl + '/';
    }

    return baseUrl;
};

exports.getSiteDisplayName = function () {
    return getSite().displayName;
};

exports.getSitePath = function () {
    return getSite()._path;
};

exports.getNearestContentByType = function (content, type) {
    type = app.name + ':' + type;
    var expr = and(
      propEq('type', type),
      pathMatch('_path', '/content' + content._path)
    );
    var result = query({
        query: expr,
        start: 0,
        count: 1
    });
    return result.total > 0 ? result.hits[0] : null;
} // exports.getNearestContentByType
