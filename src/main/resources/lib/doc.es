//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {getSite as getCurrentSite, pageUrl} from '/lib/xp/portal';
import {get as getContent, modify as modifyContent, publish as publishContent, query as queryContent} from '/lib/xp/content';
import {run} from '/lib/xp/context';
import {isSet} from '/lib/util/value';
import {toStr} from '/lib/util';
import {newCache} from '/lib/cache';
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {and, fulltext, group, like, ngram, or, propIn} from '/lib/query'
import {getContentParent, getNearestContentByType, getSitePath} from '/lib/siteUtil'
import {CT_ARTICLE, CT_DOCPAGE, CT_DOCVERSION, CT_GUIDE, isDocPage, isDocVersion, isLandingPage} from '/content-types';
import {propEq} from './query.es';

const nameCache = newCache({
    size: 10000,
    expire: 604800 // 1 week
});
const breadcrumbCache = newCache({
    size: 10000,
    expire: 604800 // 1 week
});

//──────────────────────────────────────────────────────────────────────────────
// Private Constants
//──────────────────────────────────────────────────────────────────────────────
const DEBUG = false;
const TRACE = false;
const DRAFT_BRANCH = 'draft';
const MASTER_BRANCH = 'master';

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function toSearchResultEntry(content, currentSite, hideVersion) {
    if (!content) {
        return;
    }

    const name = nameCache.get(content._id + hideVersion, function () {
        return getSearchResultName(content, hideVersion);
    });
    const breadcrumbs = breadcrumbCache.get(content._id + hideVersion, function () {
        return getSearchResultBreadcrumbs(content, hideVersion);
    });

    const result = {
        name,
        breadcrumbs,
        title: content.data.title || content.displayName,
        url: pageUrl({path: content._path}),
        path: content._path.replace(currentSite._path + '/', ''),
        extract: content.data.raw ? content.data.raw.substr(0, 64) + '…' : null
    };

    return result;
}


function getSearchResultName(content, hideVersion) {
    if (isDocPage(content)) {
        //const parentDocVersion = getNearestContentByType(content, 'docversion');
        const parentDoc = getNearestContentByType(content, 'doc');

        if (!parentDoc || hideVersion) {
            return content.displayName;
        }

        return content.displayName;
    }

    if (isDocVersion(content)) {
        const doc = getContentParent(content);
        if (hideVersion) {
            return doc.displayName;
        }

        return doc.displayName;
    }

    return content.displayName;
}

function getSearchResultBreadcrumbs(content, hideVersion) {
    const landingPage = getNearestContentByType(content, 'landing-page');

    if (isDocPage(content) || isDocVersion(content)) {
        const parentDoc = getNearestContentByType(content, 'doc');

        if (hideVersion) {
            return ' - ' + landingPage.displayName;
        }

        return ' - ' + parentDoc.displayName + ' - ' + landingPage.displayName;
    } else if (isLandingPage(content)) {
        return '';
    }

    return ' - ' + landingPage.displayName;
}

function findDocPagesAndDocVersions(doc) {
    const expr = and(
        propIn('type', [CT_DOCPAGE, CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'));

    const result = run({
        branch: DRAFT_BRANCH
    }, () => {
        return queryContent({
            query: expr,
            start: 0,
            count: 1000
        });
    });

    return result.hits;
}

function findDocVersions(doc) {
    const expr = and(
        propIn('type', [CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'));

    const result = run({
        branch: DRAFT_BRANCH
    }, () => {
        return queryContent({
            query: expr,
            start: 0,
            count: 1000
        });
    });

    return result.hits;
}

function findDocVersionByCheckout(doc, checkout) {
    const expr = and(
        propIn('type', [CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'),
        propEq('data.commit', checkout));

    const result = run({
        branch: DRAFT_BRANCH
    }, () => {
        return queryContent({
            query: expr,
            start: 0,
            count: 1000
        });
    });

    if (result.total > 0) {
        return result.hits[0];
    }

    return null;
}

function setLatestOnContent(content, latest) {
    log.info('Setting latest "' + latest + '" on ' + content._path);

    run({
        branch: DRAFT_BRANCH
    }, () => {
        return modifyContent({
            key: content._id,
            editor: function (c) {
                c.data.latest = latest;
                return c;
            },
            requireValid: false
        });
    });
}

function isLatest(content) {
    const isLatestRegExp = /^true$/i;

    return isLatestRegExp.test(content.data.latest);
}

function doMarkLatest(docVersion, publish) {
    let updated = false;

    if (!isLatest(docVersion)) {
        setLatestOnContent(docVersion, true);
        updated = true;
    }

    const contents = findDocPagesAndDocVersions(docVersion);
    contents.filter((content) => !isLatest(content)).forEach((content) => {
        setLatestOnContent(content, true);
        updated = true;
    });

    if (publish && updated) {
        publishTree(docVersion);
    }
}

function doUnMarkLatest(docVersion, publish) {
    let updated = false;

    if (isLatest(docVersion)) {
        setLatestOnContent(docVersion, false);
        updated = true;
    }

    const contents = findDocPagesAndDocVersions(docVersion);
    contents.filter((content) => isLatest(content)).forEach((content) => {
        setLatestOnContent(content, false);
        updated = true;
    });

    if (publish && updated) {
        publishTree(docVersion);
    }
}

function isPublished(content) {
    return !!run({
        branch: MASTER_BRANCH
    }, () => {
        return getContent({
            key: content._id
        });
    });
}

function publishTree(content) {
    log.info('Publishing ' + content._path);

    publishContent({
        keys: [content._id],
        sourceBranch: DRAFT_BRANCH,
        targetBranch: MASTER_BRANCH
    })
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
        'data.raw', // CT_DOCPAGE, CT_DOCVERSION and CT_GUIDE
        'data.html' // CT_ARTICLE; NOTE data.raw covers this.
        //'data.menu' // NOTE We don't want to search this!
        //'_alltext' // NOTE Nope there are things we don't want to search!
    ].join(',');

    let expr = and(
        propIn('type', [CT_DOCPAGE, CT_DOCVERSION, CT_GUIDE, CT_ARTICLE]),
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
            group(or(
                like('data.latest', 'true'),
                propIn('type', [CT_GUIDE, CT_ARTICLE]),
            ))
        );
    }

    DEBUG && log.info('expr: ' + toStr(expr));

    const result = run({
        branch: DRAFT_BRANCH
    }, () => {
        return queryContent({
            query: expr,
            start: start || 0,
            count: count || 100
        });
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

    //log.info('doc.es exports.search() entries');
    //log.info(JSON.stringify(entries, null, 4));

    return {
        total: result.total,
        count: entries.length,
        hits: entries
    };
}; // exports.search

exports.markLatest = function (doc, latestCheckout) {
    const docVersions = findDocVersions(doc);
    const latestDocVersion = docVersions.filter((docVersion) => docVersion.data.commit === latestCheckout)[0];
    const nonLatestDocVersions = docVersions.filter((docVersion) => docVersion.data.commit !== latestCheckout);

    const isDocPublished = isPublished(doc);
    doMarkLatest(latestDocVersion, isDocPublished);
    nonLatestDocVersions.forEach((nonLatestDocVersion) => doUnMarkLatest(nonLatestDocVersion, isDocPublished));
};

exports.findDocVersions = function (doc) {
    const expr = and(
        propIn('type', [CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'));

    const result = run({
        branch: DRAFT_BRANCH
    }, () => {
        return queryContent({
            query: expr,
            start: 0,
            count: 100
        });
    });

    return result.hits;
};

exports.findLatestDocVersion = function (doc) {
    const expr = and(
        propIn('type', [CT_DOCVERSION]),
        like('_path', '/content' + doc._path + '/*'),
        like('data.latest', 'true'));

    const result = run({
        branch: DRAFT_BRANCH
    }, () => {
        return queryContent({
            query: expr,
            start: 0,
            count: 100
        });
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

    const result = run({
        branch: DRAFT_BRANCH
    }, () => {
        return queryContent({
            query: expr,
            start: 0,
            count: 1000
        });
    });

    return result.hits;
};

exports.isPublished = function (content) {
    return isPublished(content);
};

exports.publishTree = function (content) {
    return publishTree(content);
}
