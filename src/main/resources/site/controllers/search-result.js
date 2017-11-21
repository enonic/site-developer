var libs = {
    portal : require('/lib/xp/portal'),
    thymeleaf : require('/lib/xp/thymeleaf'),
    menu : require('/lib/enonic/menu/menu'),
    util: require('/lib/util'),
    doc: require('/lib/doc')
};

exports.get = handleGet;
function handleGet(req) {

    var searchTerm = req.params.q;
    if (searchTerm) {
        var result = libs.doc.search(req.params.q, req.params.start, req.params.count);
    }

    var view = resolve('/site/pages/search-result/search-result.html');
    var site = libs.portal.getSite(); // Current site
    var model = createModel(req);

    function createModel(req) {
        var model = {};

        model.sitePath = site['_path'];
        model.pageTitle = 'Search result';
        model.menuItems = libs.menu.getMenuTree(3);
        model.siteName = site.displayName;

        model.searchResultPageUrl = libs.util.getSiteUrl() + 'search';
        model.serviceUrl = libs.portal.serviceUrl({
            service: 'search'
        });

        model.searchResult = result;
        model.showHeaderSearch = true;

        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model),
        contentType: 'text/html; charset=UTF-8'
    };
}