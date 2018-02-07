//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {
    getContent as getCurrentContent,
    getSite as getCurrentSite,
    serviceUrl as getServiceUrl
} from '/lib/xp/portal';
import {getMenuTree} from '/lib/enonic/menu';
import {render} from '/lib/xp/thymeleaf';


//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {RT_HTML} from '/content-types';
import {getSiteUrl} from '/lib/util';


//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW = resolve('default.html'); // The view to render


//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
export function get() {
    function getBodyClass(headerType) {
        if (!headerType) { return ''; }
        if (headerType === 'hidden') { return 'no-header'; }
        return headerType === 'layered' ? 'layered' : '';
    }

    const content = getCurrentContent();
    const {
        headerColor,
        headerType,
        pageColor
    } = content.page.config;
    const model =  {
        mainRegion: content.page.regions.main,
        sitePath: getCurrentSite()._path,
        currentPath: content._path,
        pageTitle: content.displayName,
        menuItems: getMenuTree(3),
        searchResultPageUrl: `${getSiteUrl()}search`,
        serviceUrl: getServiceUrl({ service: 'search' }),

        headerClass: headerType ? `header-${headerType}` : 'header-default', // Defines whether page header is layered or not
        headerColor, // Header logo and menu button color
        bodyClass: getBodyClass(headerType),
        pageColor,

        showHeaderSearch: true
    }; // model

    return {
        body: render(VIEW, model),
        contentType: RT_HTML
    };
} // export get
export const post = get;
