//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/thymeleaf';
import {serviceUrl as getServiceUrl} from '/lib/xp/portal';
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {getSiteUrl} from '/lib/siteUtil';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW_FILE = resolve('search.html');

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
export function get() {
    const model = {
        searchResultPageUrl: `${getSiteUrl()}search`,
        serviceUrl: getServiceUrl({
            service: 'search'
        }),
        showHeaderSearch: true
    };

    return {
        body: render(VIEW_FILE, model)
    };
} // export function get
