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
var CT_DOCPAGE    = libs.ct.CT_DOCPAGE;
var CT_DOCVERSION = libs.ct.CT_DOCVERSION;
var CT_GUIDE      = libs.ct.CT_GUIDE;

// Imported functions
var and             = libs.q.and;
var fulltext        = libs.q.fulltext;
var getContentByKey = libs.c.get;
var getSitePath     = libs.u.getSitePath;
var group           = libs.q.group;
var isSet           = libs.v.isSet;
var join            = libs.q.join;
var like            = libs.q.like;
var ngram           = libs.q.ngram;
var or              = libs.q.or;
var pageUrl         = libs.p.pageUrl;
var propIn          = libs.q.propIn;
var queryContent    = libs.c.query;
var toStr           = libs.eu.toStr;


//──────────────────────────────────────────────────────────────────────────────
// Private Contstants
//──────────────────────────────────────────────────────────────────────────────
var DEBUG = true;
var TRACE = false;


//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function toSearchResultEntry(content) {
    if (!content) {
        return;
    }

    var result = {
        name: getSearchResultName(content),
        title: content.data.title || content.displayName,
        url: pageUrl({path: content._path})
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

    return getContentByKey({key: parentPath});
}


function isDocVersion(content) {
    return content.type === CT_DOCVERSION;
}


//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.search = function (query, path, start, count) {
    TRACE && log.info('search('+query+', '+path+', '+start+', '+count+')');
    if (!isSet(query)) { query = ''; }

    path = '/content' + (!!path ? path : getSitePath());

    var fields = 'displayName^1,data.raw';
    var expr = and(
        propIn('type', [CT_DOCPAGE, CT_DOCVERSION, CT_GUIDE]),
        like('_path', path + '/*'),
        group(or(
            fulltext(fields, query, 'AND'),
            ngram(fields, query, 'AND')
        )));
    DEBUG && log.info('expr: ' + toStr(expr));

    var result = queryContent({
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
}; // exports.search
