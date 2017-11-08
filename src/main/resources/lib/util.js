var portal = require('/lib/xp/portal');

exports.getSiteUrl = function() {
    var sitePath = portal.getSite()._path;
    var baseUrl = portal.pageUrl({
        path: sitePath
    });
    
    if (baseUrl.slice(-1) != '/') {
        return baseUrl + '/';
    }
    
    return baseUrl;
};

exports.getSiteDisplayName = function () {
    return portal.getSite().displayName;
};

exports.getSitePath = function () {
    return portal.getSite()._path;
};