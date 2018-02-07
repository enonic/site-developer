import {render} from '/lib/xp/thymeleaf';
import {getSiteUrl} from '/lib/util';


const VIEW_FILE = resolve('promo.html');
const RT_HTML = 'text/html; charset=UTF-8';


export function get() {
    const model = {
        linkDocs: `${getSiteUrl()}docs`,
        linkGuides: `${getSiteUrl()}start`
    };

    return {
        body: render(VIEW_FILE, model),
        contentType: RT_HTML
    };
}
