// Includes.
var contentLib = require('/lib/xp/content');
var util = require('/lib/util');
var portalLib = require('/lib/xp/portal');

function toSearchResultEntry(content) {
    if (!content) {
        return;
    }

    var result = {
        name: getSearchResultName(content),
        title: content.data.title || content.displayName,
        url: portalLib.pageUrl({path: content._path})
    };

    return result;
}

function getSearchResultName(content) {
    if (!isDocVersion(content)) {
        return content.displayName;
    }

    var doc = getDocVersionParent(content);
    return doc.displayName + ' : ' + content.displayName;
}

function getDocVersionParent(content) {
    var path = content._path;
    var parentPath = path.substr(0, path.lastIndexOf('/'));

    return contentLib.get({key: parentPath});
}

function isDocVersion(content) {
    return content.type === app.name + ':docversion';
}

// Search entries.
exports.search = function (query, path, start, count) {

    path = '/content' + (!!path ? path : util.getSitePath());

    var expr = "type IN ('" + app.name + ":docpage', '" + app.name + ":docversion', '" + app.name + ":guide') " +
               "AND _path LIKE '" + path + "/*' " +
               "AND (fulltext('data.raw', '" + (query || '') + "', 'AND') OR ngram('data.raw', '" + (query || '') + "', 'AND'))";

    var result = contentLib.query({
        query: expr,
        start: start || 0,
        count: count || 100
    });

    var entries = [];
    for (var i = 0; i < result.hits.length; i++) {
        var hit = result.hits[i];
        var entry = toSearchResultEntry(hit);
        if (entry) {
            entry.score = hit.score;
            entries.push(entry);
        }
    }

    return {
        total: result.total,
        count: entries.length,
        hits: entries
    };
};
