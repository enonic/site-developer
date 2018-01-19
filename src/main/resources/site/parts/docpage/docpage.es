/* eslint-disable no-param-reassign */
//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/xp/thymeleaf';
import {
    getContent as getCurrentContent,
    getSite as getCurrentSite,
    pageUrl,
    processHtml,
    serviceUrl as getServiceUrl
} from '/lib/xp/portal';
import {
    get as getContentByKey,
    query as queryContent
} from '/lib/xp/content';
import {getNearestContentByType} from '/lib/util';
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {
    //APP_NAME,
    CT_DOCVERSION,
    RT_HTML,
    isDoc,
    //isDocpage,
    //isDocVersion,
    isGuide
} from '/content-types';
//import {} from '/lib/doc';
import {and, decendantOf, propEq} from '/lib/query';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW_FILE = resolve('docpage.html');


//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function getVersions(rootDoc, currentVersion) {
    const expr = and(
        propEq('type', CT_DOCVERSION),
        decendantOf(`/content${rootDoc._path}`)
    );

    const result = queryContent({
        query: expr,
        start: 0,
        count: 100
    });

    const versions = [];
    result.hits.forEach((version) => {
        versions.push({
            label: version.displayName,
            isLatest: version._id === rootDoc.data.latest,
            isCurrent: version._id === currentVersion._id,
            url: pageUrl({path: version._path})
        });
    });

    return versions;
} // function getVersions


function generateMenuItemUrl(menuItem) {
    if (!menuItem.contentId) { return ''; }

    try {
        const menuItemContent = getContentByKey({key: menuItem.contentId});
        menuItem.isActive = getCurrentContent()._id === menuItemContent._id;
        menuItem.url = pageUrl({path: menuItemContent._path});
        return menuItem.isActive;
    } catch (e) {
        log.error(e);
        return '';
    }
} // function generateMenuItemUrl


function getMenu(versionContent) {
    function processMenuUrls(menuItems) {
        if (!menuItems) {
            return false;
        }

        let hasActiveItem = false;

        menuItems.forEach((menuItem) => {
            generateMenuItemUrl(menuItem);
            const hasActive = processMenuUrls(menuItem.menuItems);
            menuItem.hasActive = hasActive;

            if (menuItem.isActive || menuItem.hasActive) {
                hasActiveItem = true;
            }
        });

        return hasActiveItem;
    }

    if (!versionContent.data.menu) {
        return null;
    }

    const menu = JSON.parse(versionContent.data.menu);

    processMenuUrls(menu.menuItems);

    return menu;
} // function getMenu


function getNavigation(menu, versionContent) {
    let activeMenuItem = null;

    function traverseMenuItems(menuItems, navPaths) {
        if (!menuItems) {
            return;
        }

        menuItems.forEach((menuItem) => {
            menuItem.nav = navPaths.slice(0);
            menuItem.nav.push({title: menuItem.title, url: menuItem.url});
            if (menuItem.isActive) {
                activeMenuItem = menuItem;
            }
            menuItem.hasChildren = !!menuItem.menuItems && menuItem.menuItems.length > 0;
            traverseMenuItems(menuItem.menuItems, menuItem.nav);
        });
    }


    const rootVersionNavItem = {title: 'Doc', url: pageUrl({path: versionContent._path})};

    traverseMenuItems(menu.menuItems, [rootVersionNavItem]);

    if (activeMenuItem) {
        return activeMenuItem.nav;
    }

    return [rootVersionNavItem];
} // function getNavigation


function createDocModel(doc) {
    const model = {};

    const serviceUrl = getServiceUrl({
        service: 'search',
        params: {
            path: doc._path
        }
    });

    const rootDoc = getNearestContentByType(doc, 'doc');
    const versionContent = getNearestContentByType(doc, 'docversion');
    const versions = getVersions(rootDoc, versionContent);
    const menu = getMenu(versionContent);
    const hasMenu = true;

    model.rootDocTitle = rootDoc.displayName;
    model.rootDocUrl = pageUrl({path: versionContent._path});
    model.service = 'search';
    model.serviceUrl = serviceUrl;
    model.versions = versions;
    model.menu = menu;
    model.hasMenu = hasMenu;
    model.sitePath = getCurrentSite()._path;

    if (menu) {
        model.hasNavigation = true;
        model.navigation = getNavigation(menu, versionContent);
    }

    return model;
} // function createDocModel


//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
export function get() {
    const content = getCurrentContent();

    const doc = isDoc(content) ? getContentByKey({key: `${content._path}/index.html`}) : content;
    if (!doc) {
        return {
            body: '<div class="docpage-content"><h3 style="text-align: center">Your doc to be placed here</h3></div>',
            contentType: RT_HTML
        };
    }

    const model = {
        title: doc.data.title || doc.displayName,
        content: processHtml({value: doc.data.html})
    };
    if (!isGuide(doc)) { Object.assign(model, createDocModel(doc)); }

    return {
        body: render(VIEW_FILE, model),
        contentType: RT_HTML
    };
} // exports get
