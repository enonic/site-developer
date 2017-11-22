// Includes.
var contentLib = require('/lib/xp/content');
var util = require('/lib/util');
var portalLib = require('/lib/xp/portal');

// To entry.
function toEntry(content, html) {
    if (!content || !isDoc(content)) {
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

function isDoc(content) {
    return content.type === app.name + ':docpage';
}

// Get entry.
exports.findEntry = function (entry) {
    var content = portalLib.getContent();

    if (content) {
        return toEntry(content, true);
    }
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
