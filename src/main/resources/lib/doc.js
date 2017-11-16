// Includes.
var contentLib = require('/lib/xp/content');
var util = require('/lib/util');

// To entry.
function toEntry(content, html) {
    if (!content || !isGuide(content)) {
        return;
    }

    var result = {
        key: content._name,
        vendor: content.data.vendor,
        name: content._name,
        title: content.displayName,
        tags: content.data.tags,
        baseUrl: content.data.baseUrl,
        url: util.getSiteUrl() + 'guides/' + content._name
    };

    if (html) {
        result.html = content.data.html
    }

    return result;
}

function isGuide(content) {
    return content.type === app.name + ':guide';
}

// Get entry.
exports.findEntry = function (entry) {
    var nodeByPath = contentLib.get({
        key: util.getSitePath() + '/' + entry.category + '/' + entry.name
    });

    if (nodeByPath) {
        return toEntry(nodeByPath, true);
    }

    var nodeById = contentLib.get({
        key: entry.name
    });

    if (nodeById) {
        return toEntry(nodeById, true);
    }
};

// Search entries.
exports.search = function (query, start, count) {
    var expr = "type ='" + app.name + ":guide' " +
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
        var entry = toEntry(contentLib.get({key: hit._id}), false);
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
