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
        url: portalLib.pageUrl({path: content._path}).replace('/index.html', ''),
        html: content.data.html
    };

    return result;
}

function toSearchResultEntry(content) {
    if (!content) {
        return;
    }

    var result = {
        name: content._name,
        title: content.data.title || content.displayName,
        url: portalLib.pageUrl({path: content._path})
    };

    return result;
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

    if (isDocpage(content) || isGuide(content)) {
        return toEntry(content, true);
    }

    if (isDoc(content) || isDocVersion(content)) {
        return toEntry(contentLib.get({key: content._path + '/index.html'}), true);
    }

    return;
};

// Search entries.
exports.search = function (query, start, count) {
    var expr = "type ='" + app.name + ":docpage' " +
               "AND _parentPath LIKE '/content" + util.getSitePath() + "/*' " +
               "AND fulltext('data.raw', '" + (query || '') + "')";

    var result = contentLib.query({
        query: expr,
        start: start || 0,
        count: count || 100
    });

    var entries = [];
    for (var i = 0; i < result.hits.length; i++) {
        var hit = result.hits[i];
        var entry = toSearchResultEntry(contentLib.get({key: hit._path.replace('/index.html', '')}));
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
