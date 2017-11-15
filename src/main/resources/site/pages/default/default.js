var libs = {
    portal : require('/lib/xp/portal'),
    thymeleaf : require('/lib/xp/thymeleaf'),
    menu : require('/lib/enonic/menu/menu'),
    util: require('/lib/enonic/util')
};

// Handle GET request
exports.get = handleGet;
exports.post = handleGet;

function handleGet(req) {
    var returnObj = {};

    if (req.headers.Accept !== 'application/json') {
        // application/json request will be handled by response filter

        var site = libs.portal.getSite(); // Current site
        var siteConfig = libs.portal.getSiteConfig();
        var content = libs.portal.getContent(); // Current content
        var view = resolve('default.html'); // The view to render
        var model = createModel(); // The model to send to the view

        returnObj = {
            body: libs.thymeleaf.render(view, model)
        }
    }

    function createModel() {
        var model = {};

        model.mainRegion = content.page.regions['main'];
        model.sitePath = site['_path'];
        model.currentPath = content._path;
        model.pageTitle = getPageTitle();
        model.metaDescription = getMetaDescription();
        model.menuItems = libs.menu.getMenuTree(3);
        model.siteName = site.displayName;

        var searchResultPage = siteConfig.searchResultPage;
        model.searchResultPageUrl = libs.portal.pageUrl({
            'id': searchResultPage
        });
        model.serviceUrl = libs.portal.serviceUrl({
            service: 'search'
        });

        // Defines whether page header is layered or not
        model.headerType = content.page.config['headerType'] ? content.page.config['headerType'] : 'default';

        // Header logo and menu button color
        model.headerColor = content.page.config['headerColor'] === 'white' ? 'dark' : null;

        model.showHeaderSearch = showHeaderSearch();

        model.socialLinks = getSocialLinks();

        return model;
    }

    function getPageTitle() {
        return content['displayName'] + ' - ' + site['displayName'];
    }

    function getMetaDescription() {
        var htmlMeta = getExtradata(content, 'html-meta');
        var metaDescription = htmlMeta.htmlMetaDescription || '';
        return metaDescription;
    }

    function getExtradata(content, property) {
        var appNamePropertyName = app.name.replace(/\./g,'-');
        // Short way of getting nested objects
        // http://blog.osteele.com/posts/2007/12/cheap-monads/
        var extraData = ((content.x || {})[appNamePropertyName] || {})[property] || {};
        return extraData;
    }

    function showHeaderSearch() {
        var isFrontPage = content._path === site._path ? true : false;
        var isSearchPage = content._id === siteConfig.searchResultPage ? true : false;

        return !(isFrontPage || isSearchPage);
    }

    function getSocialLinks() {
        return [
            {
                name: 'twitter',
                url: 'https://twitter.com/EnonicHQ'
            },
            {
                name: 'facebook',
                url: 'https://www.facebook.com/enonic.no'
            },
            {
                name: 'linkedin',
                url: 'https://www.linkedin.com/company/enonic'
            },
            {
                name: 'gplus',
                url: 'https://plus.google.com/+EnonicCommunity/'
            },
            {
                name: 'youtube',
                url: 'https://www.youtube.com/user/EnonicCommunity'
            },
            {
                name: 'webagility',
                url: 'http://webagility.com'
            }
        ];
    }

    return returnObj;

}