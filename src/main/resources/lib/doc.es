//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {getSite as getCurrentSite, pageUrl} from '/lib/xp/portal';
import {modify as modifyContent, query as queryContent} from '/lib/xp/content';
import {isSet} from '/lib/enonic/util/value';
import {toStr} from '/lib/enonic/util';
import {CT_DOCPAGE, CT_DOCVERSION, CT_GUIDE} from '/content-types';
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {and, fulltext, group, like, ngram, or, propIn} from '/lib/query'
import {getContentParent, getNearestContentByType, getSitePath} from '/lib/util'

//──────────────────────────────────────────────────────────────────────────────
// Private Constants
//──────────────────────────────────────────────────────────────────────────────
const DEBUG = true;
const TRACE = false;
const DRAFT_BRANCH = 'draft';

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function toSearchResultEntry(content, currentSite, hideVersion) {
    if (!content) {
        return;
    }

    const result = {
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
        const parentDocVersion = getNearestContentByType(content, 'docversion');

        if (!parentDocVersion || hideVersion) {
            return content.displayName;
        }

        return content.displayName + ' (' + parentDocVersion.displayName + ')';
    }

    if (isDocVersion(content)) {
        const doc = getContentParent(content);
        if (hideVersion) {
            return doc.displayName;
        }

        return doc.displayName + ' (' + content.displayName + ')';
    }

    return content.displayName;
}

function findDocpagesAndDocversions(doc) {
    const expr = and(
        propIn('type', [CT_DOCPAGE, CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'));

    const result = queryContent({
        query: expr,
        start: 0,
        count: 1000,
        branch: DRAFT_BRANCH
    });

    return result.hits;
}

function findDocVersionByCheckout(doc, checkout) {
    const expr = and(
        propIn('type', [CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'),
        like('data.commit', checkout));

    const result = queryContent({
        query: expr,
        start: 0,
        count: 1000,
        branch: DRAFT_BRANCH
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
        requireValid: false,
        branch: DRAFT_BRANCH
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

    const hideVersion = !!path;
    const restrictSearchToLatestOnly = !path;
    path = '/content' + (!!path ? path : getSitePath());

    const fields = [ // have not checked CT_DOCPAGE
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

    let expr = and(
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

    const result = queryContent({
        query: expr,
        start: start || 0,
        count: count || 100,
        branch: DRAFT_BRANCH
    });

    const currentSite = getCurrentSite();
    const entries = [];
    for (let i = 0; i < result.hits.length; i++) {
        const hit = result.hits[i];
        const entry = toSearchResultEntry(hit, currentSite, hideVersion);
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
    const contents = findDocpagesAndDocversions(doc);

    contents.forEach(function (content) {
        setLatestOnContent(content, false);
    });
};

exports.markLatest = function (doc, checkout) {
    const docVersion = findDocVersionByCheckout(doc, checkout);
    if (!docVersion) {
        return;
    }

    setLatestOnContent(docVersion, true);

    const contents = findDocpagesAndDocversions(docVersion);
    contents.forEach(function (content) {
        setLatestOnContent(content, true);
    });
};

exports.setLatestOnContent = function (content, latest) {
    setLatestOnContent(content, latest);
};

exports.findDocVersions = function (doc) {
    const expr = and(
        propIn('type', [CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'));

    const result = queryContent({
        query: expr,
        start: 0,
        count: 100,
        branch: DRAFT_BRANCH
    });

    return result.hits;
};

exports.findLatestDocVersion = function (doc) {
    const expr = and(
        propIn('type', [CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'),
        like('data.latest', 'true'));

    const result = queryContent({
        query: expr,
        start: 0,
        count: 100,
        branch: DRAFT_BRANCH
    });

    if (result.total > 0) {
        return result.hits[0];
    }

    return null;
};

exports.findDocVersionByCheckout = function (doc, checkout) {
    return findDocVersionByCheckout(doc, checkout);
};

exports.findChildren = function (content) {
    const expr = like('_path', '/content' + content._path + '/*');

    const result = queryContent({
        query: expr,
        start: 0,
        count: 1000,
        branch: DRAFT_BRANCH
    });

    return result.hits;
};
