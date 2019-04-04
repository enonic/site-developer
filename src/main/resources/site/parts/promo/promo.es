//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/thymeleaf';
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {getSiteUrl} from '/lib/siteUtil';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW_FILE = resolve('promo.html');
const RT_HTML = 'text/html; charset=UTF-8';

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
export function get() {
    const model = {
        linkDocs: `${getSiteUrl()}docs`,
        linkGuides: `${getSiteUrl()}guides`,
        linkStart: `${getSiteUrl()}start`
    };

    return {
        body: render(VIEW_FILE, model),
        contentType: RT_HTML
    };
}
