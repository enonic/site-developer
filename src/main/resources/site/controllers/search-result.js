// Imports
var libs = {
    portal : require('/lib/xp/portal'),
    thymeleaf : require('/lib/xp/thymeleaf'),
    menu : require('/lib/enonic/menu'),
    util: require('/lib/util'),
    doc: require('/lib/doc')
};

// Functions
var getCurrentSite = libs.portal.getSite;
var getMenuTree = libs.menu.getMenuTree;
var getSiteUrl = libs.util.getSiteUrl;
var searchDocs = libs.doc.search;
var serviceUrl = libs.portal.serviceUrl;
var render = libs.thymeleaf.render;

// Constants
var VIEW_FILE = resolve('/site/pages/search-result/search-result.html');
var EMPTY_RESULT = {count: 0, total: 0, hits: []};

// Exports
exports.get = function(req) {
    var currentSite = getCurrentSite();
    var model = {
      menuItems: getMenuTree(3),
      pageTitle: 'Search result',
      searchResult: req.params.q
        ? searchDocs(req.params.q, req.params.start, req.params.count)
        : EMPTY_RESULT,
      searchResultPageUrl: getSiteUrl() + 'search',
      serviceUrl: serviceUrl({service: 'search'}),
      showHeaderSearch: true,
      siteName: currentSite.displayName,
      sitePath: currentSite['_path']
    }; // model

    return {
        body: render(VIEW_FILE, model),
        contentType: 'text/html; charset=UTF-8'
    };
} // get
