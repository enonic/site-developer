//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
var libs = {
    ct:        require('/content-types'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    portal:    require('/lib/xp/portal'),
    doc:       require('/lib/doc'),
    content:   require('/lib/xp/content'),
    q:         require('/lib/query'),
    util:      require('/lib/util')
}

// Imported Constants
var APP_NAME      = libs.ct.APP_NAME;
var CT_DOCVERSION = libs.ct.CT_DOCVERSION;
var RT_HTML       = libs.ct.RT_HTML;

// Imported functions
var and               = libs.q.and;
var decendantsOf      = libs.q.decendantsOf;
var getContentByKey   = libs.content.get;
var getCurrentContent = libs.portal.getContent;
var getCurrentSite    = libs.portal.getSite;
var isDoc             = libs.ct.isDoc;
var isDocpage         = libs.ct.isDocpage;
var isDocVersion      = libs.ct.isDocVersion;
var isGuide           = libs.ct.isGuide;
var pageUrl           = libs.portal.pageUrl;
var pathMatch         = libs.q.pathMatch;
var processHtml       = libs.portal.processHtml;
var propEq            = libs.q.propEq;
var queryContent      = libs.content.query;
var render            = libs.thymeleaf.render;
var serviceUrl        = libs.portal.serviceUrl;

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
var VIEW_FILE = resolve('docpage.html');


//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.get = function (req) {
    var content = getCurrentContent();

    var doc = isDoc(content) ? getContentByKey({key: content._path + '/index.html'}) : content;
    if (!doc) {
        return {
            body: '<div class="docpage-content"><h3 style="text-align: center">Your doc to be placed here</h3></div>',
            contentType: RT_HTML
        };
    }

    var model = {
        title: doc.data.title || doc.displayName,
        content: processHtml({value: doc.data.html})
    };
    if(!isGuide(doc)) { Object.assign(model, createDocModel(doc)); }

    return {
        body: render(VIEW_FILE, model),
        contentType: RT_HTML
    };
}; // exports.get



function createDocModel(doc) {
    var model = {};

    var serviceUrl = serviceUrl({
        service: 'search',
        params: {
            path: doc._path
        }
    });

    var rootDoc = libs.util.getNearestContentByType(doc, 'doc');
    var versionContent = libs.util.getNearestContentByType(doc, 'docversion');
    var versions = getVersions(rootDoc, versionContent);
    var menu = getMenu(versionContent);
    var hasMenu = true;

    model.rootDocTitle = rootDoc.displayName;
    model.rootDocUrl = pageUrl({path: versionContent._path});
    model.service = 'search';
    model.serviceUrl = serviceUrl;
    model.versions = versions;
    model.menu = menu;
    model.hasMenu = hasMenu;
    model.sitePath = getCurrentSite()['_path'];

    if (!!menu) {
        model.hasNavigation = true;
        model.navigation = getNavigation(menu, versionContent);
    }

    return model;
} // function createDocModel


function getVersions(rootDoc, currentVersion) {
    var expr = and(
      propEq('type', CT_DOCVERSION),
      decendantsOf('/content' + rootDoc._path)
    );

    var result = queryContent({
        query: expr,
        start: 0,
        count: 100
    });

    var versions = [];
    result.hits.forEach(function (version) {
        versions.push({
            label: version.displayName,
            isLatest: version._id == rootDoc.data.latest,
            isCurrent: version._id == currentVersion._id,
            url: pageUrl({path: version._path})
        })
    });

    return versions;
} // function getVersions


function getMenu(versionContent) {
    if (!versionContent.data.menu) {
        return null;
    }

    var menu = JSON.parse(versionContent.data.menu);

    processMenuUrls(menu.menuItems);

    function processMenuUrls(menuItems) {
        if (!menuItems) {
            return false;
        }

        var hasActiveItem = false;

        menuItems.forEach(function (menuItem) {
            generateMenuItemUrl(menuItem);
            var hasActive = processMenuUrls(menuItem.menuItems);
            menuItem.hasActive = hasActive;

            if (menuItem.isActive || menuItem.hasActive) {
                hasActiveItem = true;
            }
        });

        return hasActiveItem;
    }

    return menu;
} // function getMenu


function generateMenuItemUrl(menuItem) {
    if (!menuItem.contentId) {
        return '';
    }

    try {
        var menuItemContent = getContentByKey({key: menuItem.contentId});
    }
    catch (e) {
        log.error(e);
        return '';
    }

    var currentContent = getCurrentContent();
    var isActive = currentContent._id == menuItemContent._id ? true : false;

    menuItem.isActive = isActive;
    menuItem.url = pageUrl({path: menuItemContent._path});

    return isActive;
} // function generateMenuItemUrl


function getNavigation(menu, versionContent) {

    var activeMenuItem = null;

    var rootVersionNavItem = {title: 'Doc', url: pageUrl({path: versionContent._path})};

    traverseMenuItems(menu.menuItems, [rootVersionNavItem]);

    function traverseMenuItems(menuItems, navPaths) {
        if (!menuItems) {
            return;
        }

        menuItems.forEach(function (menuItem) {
            menuItem.nav = navPaths.slice(0);
            menuItem.nav.push({title: menuItem.title, url: menuItem.url});
            if (menuItem.isActive) {
                activeMenuItem = menuItem;
            }
            menuItem.hasChildren = !!menuItem.menuItems && menuItem.menuItems.length > 0;
            traverseMenuItems(menuItem.menuItems, menuItem.nav);
        });
    }

    if (activeMenuItem) {
        return activeMenuItem.nav;
    }

    return [rootVersionNavItem];
} // function getNavigation
