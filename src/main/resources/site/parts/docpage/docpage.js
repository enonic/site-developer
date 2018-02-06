var libs = {
    thymeleaf: require('/lib/xp/thymeleaf'),
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content'),
    util: require('/lib/util')
}

exports.get = function (req) {
    var doc = getDoc();

    if (!doc) {
        return {
            body: '<div class="docpage-content"><h3 style="text-align: center">Your doc to be placed here</h3></div>',
            contentType: 'text/html'
        };
    }

    var model = createModel(doc);
    var view = resolve('docpage.html');

    return {
        body: libs.thymeleaf.render(view, model),
        contentType: 'text/html; charset=UTF-8'
    };
};

function getDoc() {
    var content = libs.portal.getContent();

    if (isDoc(content)) {
        return libs.content.get({key: content._path + '/index.html'});
    }

    return content;
};

function createModel(doc) {
    if (isGuide(doc)) {
        return doCreateModel(doc, 'guide');
    }

    return createDocModel(doc);
}

function doCreateModel(doc, type) {
    return {
        title: doc.data.title || doc.displayName,
        content: libs.portal.processHtml({value: doc.data.html}),
        type: type
    };
}

function createDocModel(doc) {
    var model = doCreateModel(doc, 'doc');
    var rootDoc = libs.util.getNearestContentByType(doc, 'doc');
    var versionContent = libs.util.getNearestContentByType(doc, 'docversion');
    var versions = getVersions(rootDoc, versionContent);
    var menu = getMenu(versionContent);

    var serviceUrl = libs.portal.serviceUrl({
        service: 'search',
        params: {
            path: versionContent._path
        }
    });

    model.searchResultPageUrl = libs.util.getSiteUrl() + 'search';
    model.searchDocId = versionContent._id;
    model.rootDocTitle = rootDoc.displayName;
    model.rootDocUrl = libs.portal.pageUrl({path: versionContent._path});
    model.service = 'search';
    model.serviceUrl = serviceUrl;
    model.versions = versions;
    model.menu = menu;
    model.sitePath = libs.portal.getSite()['_path'];

    if (!!menu) {
        model.navigation = getNavigation(menu, versionContent);
        model.hasNavigation = model.navigation.length > 1;
    }

    return model;
}

function getVersions(rootDoc, currentVersion) {
    var expr = "type = '" + app.name + ":docversion' AND _path LIKE '/content" + rootDoc._path + "/*' ";

    var result = libs.content.query({
        query: expr,
        start: 0,
        count: 100
    });

    var versions = [];
    result.hits.forEach(function (version) {
        versions.push({
            label: version.displayName,
            isLatest: version.data.latest,
            isCurrent: version._id == currentVersion._id,
            url: libs.portal.pageUrl({path: version._path})
        })
    });

    return versions;
}

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
}

function generateMenuItemUrl(menuItem) {
    if (!menuItem.contentId) {
        return '';
    }

    try {
        var menuItemContent = libs.content.get({key: menuItem.contentId});
    }
    catch (e) {
        log.error(e);
        return '';
    }

    var currentContent = libs.portal.getContent();
    var isActive = currentContent._id == menuItemContent._id ? true : false;

    menuItem.isActive = isActive;
    menuItem.url = libs.portal.pageUrl({path: menuItemContent._path});

    return isActive;
}

function getNavigation(menu, versionContent) {

    var activeMenuItem = null;

    var rootVersionNavItem = {title: 'Doc', url: libs.portal.pageUrl({path: versionContent._path})};

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
}

function isDocpage(content) {
    return content.type === app.name + ':docpage';
}

function isDoc(content) {
    return content.type === app.name + ':doc';
}

function isDocVersion(content) {
    return content.type === app.name + ':docversion';
}

function isGuide(content) {
    return content.type === app.name + ':guide';
}
