/* eslint-disable no-param-reassign */
//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
//import {toStr} from '/lib/enonic/util';
import {getContent as getCurrentContent, pageUrl, processHtml} from '/lib/xp/portal';
import {render} from '/lib/xp/thymeleaf';
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {RT_HTML} from '/content-types';


//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW_FILE = resolve('article.html');


//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────


//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
export function get() {
    const article = getCurrentContent();

    let model = {
        title: article.data.title || article.displayName,
        content: processHtml({value: article.data.html})
    };

    return {
        body: render(VIEW_FILE, model),
        contentType: RT_HTML
    };
} // exports get
