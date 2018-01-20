var libs = {
    p: require('/lib/xp/portal'),
    c: require('/lib/xp/content')
};

// Imported functions
var getSite = libs.p.getSite;
var pageUrl = libs.p.pageUrl;
var query = libs.c.query;
var getContentByKey = libs.c.get;

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
    var expr = "type = '" + type + "'" + " AND pathMatch('_path', '/content" + content._path + "') ";

    var result = query({
        query: expr,
        start: 0,
        count: 100
    });

    if (result.total > 0) {
        return result.hits[0];
    }

    return null;
}

exports.getContentParent = function (content) {
    var path = content._path;
    var parentPath = path.substr(0, path.lastIndexOf('/'));

    return getContentByKey({key: parentPath});
}
