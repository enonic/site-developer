/* eslint-disable no-param-reassign */
//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
//import {toStr} from '/lib/util';
import {get as getContentByKey, query as queryContent} from '/lib/xp/content';
import {
    getContent as getCurrentContent,
    getSite as getCurrentSite,
    pageUrl,
    processHtml,
    serviceUrl as getServiceUrl
} from '/lib/xp/portal';
import {render} from '/lib/thymeleaf';
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {CT_DOCVERSION, isDoc, isGuide, RT_HTML} from '/content-types';
import {and, decendantOf, propEq} from '/lib/query';
import {getNearestContentByType, getSiteUrl} from '/lib/siteUtil';


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
    ); //log.info(`expr:${toStr(expr)}`);

    const result = queryContent({
        query: expr,
        start: 0,
        count: 100
    });

    const versions = [];
    result.hits.forEach((version) => {
        versions.push({
            label: version.displayName,
            isLatest: version.data.latest,
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


function getNavigation(menu, versionContent, rootName) {
    let activeMenuItem = null;

    //log.info(JSON.stringify(menu, null, 2));
    //log.info(JSON.stringify(versionContent, null, 2));

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


    const rootVersionNavItem = {title: rootName || 'Doc', url: pageUrl({path: versionContent._path})};

    traverseMenuItems(menu.menuItems, [rootVersionNavItem]);

    if (activeMenuItem) {
        return activeMenuItem.nav;
    }

    return [rootVersionNavItem];
} // function getNavigation


function createDocModel(doc) {
    //log.info(`createDocModel()`);
    const rootDoc = getNearestContentByType(doc, 'doc');
    const versionContent = getNearestContentByType(doc, 'docversion'); //log.info(`versionContent:${toStr(versionContent)}`);
    const model = {
        rootDocTitle: rootDoc.displayName,
        rootDocUrl: pageUrl({path: versionContent._path}),
        service: 'search',
        searchDocId: doc._id,
        searchResultPageUrl: `${getSiteUrl()}search`,
        serviceUrl: getServiceUrl({
            service: 'search',
            params: {
                path: versionContent._path
            }
        }),
        versions: getVersions(rootDoc, versionContent),
        menu: getMenu(versionContent),
        hasMenu: true, // TODO Hardcode???,
        sitePath: getCurrentSite()._path
    };

    if (model.menu) {
        model.navigation = getNavigation(model.menu, versionContent, rootDoc.displayName);
        model.hasNavigation = model.navigation.length > 1;
    }

    return model;
} // function createDocModel


//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
export function get() {
    const content = getCurrentContent(); //log.info(`content:${toStr(content)}`);

    const doc = isDoc(content) ? getContentByKey({key: `${content._path}/index.html`}) : content; //log.info(`doc:${toStr(doc)}`);
    if (!doc) {
        return {
            body: '<div class="docpage-content"><h3 style="text-align: center">Your doc to be placed here</h3></div>',
            contentType: RT_HTML
        };
    }

    let model = {
        title: doc.data.title || doc.displayName,
        content: processHtml({value: doc.data.html}),
        type: isGuide(doc) ? 'guide' : 'doc'
    }; //log.info(`model:${toStr(model)}`);
    if (!isGuide(doc)) { model = Object.assign({}, model, createDocModel(doc)); }
    //log.info(`model modified:${toStr(model)}`);

    return {
        body: render(VIEW_FILE, model),
        contentType: RT_HTML
    };
} // exports get
