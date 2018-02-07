import {serviceUrl as getServiceUrl} from '/lib/xp/portal';
import {getSiteUrl} from '/lib/util';
import {render} from '/lib/xp/thymeleaf';


const VIEW_FILE = resolve('search.html');


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
