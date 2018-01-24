//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
var libs = {
    c: require('/lib/xp/content'),
    ct: require('/content-types'),
    q: require('/lib/query'),
    p: require('/lib/xp/portal'),
    u: require('/lib/util'),
    eu: require('/lib/enonic/util'),
    v: require('/lib/enonic/util/value')
};

// Imported Contstants
var CT_DOCPAGE = libs.ct.CT_DOCPAGE;
var CT_DOCVERSION = libs.ct.CT_DOCVERSION;
var CT_GUIDE = libs.ct.CT_GUIDE;

// Imported functions
var and = libs.q.and;
var fulltext = libs.q.fulltext;
var getSitePath = libs.u.getSitePath;
var group = libs.q.group;
var isSet = libs.v.isSet;
var like = libs.q.like;
var ngram = libs.q.ngram;
var or = libs.q.or;
var pageUrl = libs.p.pageUrl;
var propIn = libs.q.propIn;
var queryContent = libs.c.query;
var modifyContent = libs.c.modify;
var toStr = libs.eu.toStr;
var getNearestContentByType = libs.u.getNearestContentByType;
var getContentParent = libs.u.getContentParent;
var getCurrentSite = libs.p.getSite;


//──────────────────────────────────────────────────────────────────────────────
// Private Contstants
//──────────────────────────────────────────────────────────────────────────────
var DEBUG = true;
var TRACE = false;


//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function toSearchResultEntry(content, currentSite, hideVersion) {
    if (!content) {
        return;
    }

    var result = {
        name: getSearchResultName(content, hideVersion),
        title: content.data.title || content.displayName,
        url: pageUrl({path: content._path}),
        path: content._path.replace(currentSite._path + '/', ''),
        extract: content.data.raw ? content.data.raw.substr(0, 64) + '...' : null
    };

    return result;
}


function getSearchResultName(content, hideVersion) {
    if (isDocPage(content)) {
        var parentDocVersion = getNearestContentByType(content, 'docversion');

        if (!parentDocVersion || hideVersion) {
            return content.displayName;
        }

        return content.displayName + ' (' + parentDocVersion.displayName + ')';
    }

    if (isDocVersion(content)) {
        var doc = getContentParent(content);
        if (hideVersion) {
            return doc.displayName;
        }

        return doc.displayName + ' (' + content.displayName + ')';
    }

    return content.displayName;
}

function findDocpagesAndDocversions(doc) {
    var expr = and(
        propIn('type', [CT_DOCPAGE, CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'));

    var result = queryContent({
        query: expr,
        start: 0,
        count: 1000
    });

    return result.hits;
}

function findDocVersionByCheckout(doc, checkout) {
    var expr = and(
        propIn('type', [CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'),
        like('data.checkout', checkout));

    var result = queryContent({
        query: expr,
        start: 0,
        count: 1000
    });

    if (result.total > 0) {
        return result.hits[0];
    }

    return null;
}

function setLatestOnContent(content, latest) {
    modifyContent({
        key: content._id,
        editor: function (c) {
            c.data.latest = latest;
            return c;
        },
        requireValid: false
    });
}

function isDocVersion(content) {
    return content.type === CT_DOCVERSION;
}

function isGuide(content) {
    return content.type === CT_GUIDE;
}

function isDocPage(content) {
    return content.type === CT_DOCPAGE;
}


//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.search = function (query, path, start, count) {
    TRACE && log.info('search(' + query + ', ' + path + ', ' + start + ', ' + count + ')');
    if (!isSet(query)) {
        query = '';
    }

    var hideVersion = !!path;
    var restrictSearchToLatestOnly = !path;
    path = '/content' + (!!path ? path : getSitePath());

    var fields = [ // have not checked CT_DOCPAGE
        'data.title^3', // CT_DOCPAGE and CT_DOCVERSION
        'displayName^2', // All content
        'data.shortdescription^1', // CT_GUIDE
        'data.tags^1', // CT_GUIDE
        'data.repository^1', // CT_GUIDE
        'data.raw' // CT_DOCPAGE, CT_DOCVERSION and CT_GUIDE
        //'data.html' // NOTE data.raw covers this.
        //'data.menu' // NOTE We don't want to search this!
        //'_alltext' // NOTE Nope there are things we don't want to search!
    ].join(',');

    var expr = and(
        propIn('type', [CT_DOCPAGE, CT_DOCVERSION, CT_GUIDE]),
        group(or(
            like('_path', path + '/*'),
            like('_path', path)
        )),
        group(or(
            fulltext(fields, query, 'AND'),
            ngram(fields, query, 'AND')
        )));

    if (restrictSearchToLatestOnly) {
        expr = and(
            expr,
            like('data.latest', 'true')
        );
    }

    DEBUG && log.info('expr: ' + toStr(expr));

    var result = queryContent({
        query: expr,
        start: start || 0,
        count: count || 100
    });

    var currentSite = getCurrentSite();
    var entries = [];
    for (var i = 0; i < result.hits.length; i++) {
        var hit = result.hits[i];
        var entry = toSearchResultEntry(hit, currentSite, hideVersion);
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
}; // exports.search

exports.unmarkLatest = function (doc) {
    var contents = findDocpagesAndDocversions(doc);

    contents.forEach(function (content) {
        setLatestOnContent(content, false);
    });
};

exports.markLatest = function (doc, checkout) {
    var docVersion = findDocVersionByCheckout(doc, checkout);
    if (!docVersion) {
        return;
    }

    setLatestOnContent(docVersion, true);

    var contents = findDocpagesAndDocversions(docVersion);
    contents.forEach(function (content) {
        setLatestOnContent(content, true);
    });
};

exports.setLatestOnContent = function (content, latest) {
    setLatestOnContent(content, latest);
};

exports.findDocVersions = function (doc) {
    var expr = and(
        propIn('type', [CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'));

    var result = queryContent({
        query: expr,
        start: 0,
        count: 100
    });

    return result.hits;
};

exports.findLatestDocVersion = function (doc) {
    var expr = and(
        propIn('type', [CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'),
        like('data.latest', 'true'));

    var result = queryContent({
        query: expr,
        start: 0,
        count: 100
    });

    if (result.total > 0) {
        return result.hits[0];
    }

    return null;
};
