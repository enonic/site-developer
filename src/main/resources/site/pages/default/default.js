// Imports
var libs = {
    portal : require('/lib/xp/portal'),
    thymeleaf : require('/lib/xp/thymeleaf'),
    menu: require('/lib/enonic/menu'),
    util: require('/lib/util')
};

// Imported functions
var getSite = libs.portal.getSite;
var getContent = libs.portal.getContent;
var serviceUrl = libs.portal.serviceUrl;
var render = libs.thymeleaf.render;
var getMenuTree = libs.menu.getMenuTree;
var getSiteUrl = libs.util.getSiteUrl;

// Handle GET request
exports.get = handleGet;
exports.post = handleGet;

function handleGet(req) {

    var site = getSite(); // Current site
    var content = getContent(); // Current content
    var view = resolve('default.html'); // The view to render
    var model = createModel(); // The model to send to the view

    function createModel() {
        var model = {};

        // Used directly in view
        model.mainRegion = content.page.regions['main'];
        model.pageColor = getPageColor();
        model.bodyClass = getBodyClass();

        // Used in fragments (not mentioned in view)
        model.sitePath = site['_path'];
        model.currentPath = content._path;
        model.pageTitle = getPageTitle();
        model.menuItems = getMenuTree(3);
        model.searchResultPageUrl = getSiteUrl() + 'search';
        model.serviceUrl = serviceUrl({
            service: 'search'
        });
        model.headerClass = getHeaderClass(); // Defines whether page header is layered or not
        model.headerColor = getHeaderColor(); // Header logo and menu button color
        model.showHeaderSearch = true;

        return model;
    }

    function getPageTitle() {
        return content['displayName'];
    }

    function getHeaderClass() {
        var headerType = getHeaderType();

        if (!headerType) {
            return 'header-default';
        }

        return 'header-' + headerType;
    }

    function getBodyClass() {
        var headerType = getHeaderType();

        if (!!headerType && headerType == 'hidden') {
            return 'no-header';
        }

        if (!!headerType && headerType == 'layered') {
            return 'layered';
        }

        return '';
    }

    function getHeaderType() {
        return content.page.config['headerType'];
    }

    function getHeaderColor() {
        return content.page.config['headerColor'];
    }

    function getPageColor() {
        return content.page.config['pageColor'];
    }

    return {
        body: render(view, model)
    }

}