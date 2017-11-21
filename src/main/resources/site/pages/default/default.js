var libs = {
    portal : require('/lib/xp/portal'),
    thymeleaf : require('/lib/xp/thymeleaf'),
    menu : require('/lib/enonic/menu/menu'),
    util: require('/lib/util')
};

// Handle GET request
exports.get = handleGet;
exports.post = handleGet;

function handleGet(req) {

    var site = libs.portal.getSite(); // Current site
    var content = libs.portal.getContent(); // Current content
    var view = resolve('default.html'); // The view to render
    var model = createModel(); // The model to send to the view

    function createModel() {
        var model = {};

        model.mainRegion = content.page.regions['main'];
        model.sitePath = site['_path'];
        model.currentPath = content._path;
        model.pageTitle = getPageTitle();
        model.menuItems = libs.menu.getMenuTree(3);

        model.searchResultPageUrl = libs.util.getSiteUrl() + 'search';
        model.serviceUrl = libs.portal.serviceUrl({
            service: 'search'
        });

        // Defines whether page header is layered or not
        model.headerType = content.page.config['headerType'] ? content.page.config['headerType'] : 'default';

        // Header logo and menu button color
        model.headerColor = content.page.config['headerColor'] === 'white' ? 'dark' : null;

        model.showHeaderSearch = true;

        return model;
    }

    function getPageTitle() {
        return content['displayName'];
    }

    return {
        body: libs.thymeleaf.render(view, model)
    }

}