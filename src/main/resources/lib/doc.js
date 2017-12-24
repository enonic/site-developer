// Includes.
var contentLib = require('/lib/xp/content');
var util = require('/lib/util');
var portalLib = require('/lib/xp/portal');

// To entry.
function toEntry(content) {
    if (!content) {
        return;
    }

    var result = {
        key: content._name,
        name: content._name,
        title: content.data.title || content.displayName,
        tags: content.data.tags,
        url: portalLib.pageUrl({path: content._path}),
        html: content.data.html
    };

    return result;
}

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

function isDocpage(content) {
    return content.type === app.name + ':docpage';
}

function isDoc(content) {
    return content.type === app.name + ':doc';
}

function isDocVersion(content) {
    return content.type === app.name + ':docversion';
}

function isGuide(content) {
    return content.type === app.name + ':guide';
}

// Get entry.
exports.findEntry = function (entry) {
    var content = portalLib.getContent();

    if (isDocpage(content) || isGuide(content) || isDocVersion(content)) {
        return toEntry(content, true);
    }

    if (isDoc(content)) {
        return toEntry(contentLib.get({key: content._path + '/index.html'}), true);
    }

    return;
};

// Search entries.
exports.search = function (query, start, count) {
    var expr = "type IN ('" + app.name + ":docpage', '" + app.name + ":docversion', '" + app.name + ":guide') " +
               "AND _path LIKE '/content" + util.getSitePath() + "/*' " +
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
