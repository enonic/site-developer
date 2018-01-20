// Imports
var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    menu: require('/lib/enonic/menu'),
    eutil: require('/lib/enonic/util'),
    util: require('/lib/util'),
    doc: require('/lib/doc'),
    u: require('/lib/util'),
    content: require('/lib/xp/content')
};

// Functions
var getCurrentSite = libs.portal.getSite;
var getMenuTree = libs.menu.getMenuTree;
var getSiteUrl = libs.util.getSiteUrl;
var render = libs.thymeleaf.render;
var searchDocs = libs.doc.search;
var serviceUrl = libs.portal.serviceUrl;
var toStr = libs.eutil.toStr;
var getContent = libs.content.get;
var getContentParent = libs.u.getContentParent;

// Constants
var DEBUG = false;
var VIEW_FILE = resolve('/site/pages/search-result/search-result.html');
var EMPTY_RESULT = {count: 0, total: 0, hits: []};

// Exports
exports.get = function (req) {
    log.info('Search result req:' + toStr(req));
    var currentSite = getCurrentSite();
    var docToSearchIn = getDocToSearchIn(req);
    var searchPath = getSearchPath(docToSearchIn);
    var searchDocId = getIdOfDocToSearchIn(docToSearchIn);
    var filterText = getFilterText(docToSearchIn);

    var model = {

        // Used directly in view
        searchResult: req.params.q
            ? searchDocs(req.params.q, searchPath, req.params.start, req.params.count)
            : EMPTY_RESULT,
        filterText: filterText,

        // Used in fragments (not mentioned in view)
        searchDocId: searchDocId,
        menuItems: getMenuTree(3),
        pageTitle: 'Search result',
        searchResultPageUrl: getSiteUrl() + 'search',
        serviceUrl: generateServiceUrl(docToSearchIn),
        showHeaderSearch: false,
        siteName: currentSite.displayName,
        sitePath: currentSite['_path'],
        searchQuery: req.params.q

    }; // model
    DEBUG && log.info('model:' + toStr(model));

    return {
        body: render(VIEW_FILE, model),
        contentType: 'text/html; charset=UTF-8'
    };
} // get

function getDocToSearchIn(req) {
    var docId = req.params.doc;

    if (!docId) {
        return null;
    }

    return getContent({key: docId});
}

function getSearchPath(docToSearchIn) {
    if (!docToSearchIn) {
        return null;
    }

    return docToSearchIn._path;
}

function generateServiceUrl(docToSearchIn) {
    if (docToSearchIn) {
        return serviceUrl({
            service: 'search',
            params: {
                path: docToSearchIn._path
            }
        })
    }

    return serviceUrl({service: 'search'});
}

function getIdOfDocToSearchIn(docToSearchIn) {
    if (!docToSearchIn) {
        return null;
    }

    return docToSearchIn._id;
}

function getFilterText(docToSearchIn) {
    if (!docToSearchIn) {
        return null;
    }

    var doc = getContentParent(docToSearchIn);
    return doc.displayName + ' (' + docToSearchIn.displayName + ')';
}
