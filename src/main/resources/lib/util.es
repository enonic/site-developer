//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
//import {toStr} from '/lib/enonic/util';
import {
    query as queryContent,
    get as getContentByKey
} from '/lib/xp/content';
import {getSite, pageUrl} from '/lib/xp/portal';
import {and, pathMatch, propEq} from '/lib/query';


export function getContentParent(content) {
    const path = content._path;
    const parentPath = path.substr(0, path.lastIndexOf('/'));
    return getContentByKey({key: parentPath});
}


export function getSiteUrl() {
    const baseUrl = pageUrl({ path: getSite()._path });
    return `${baseUrl}${baseUrl.slice(-1) !== '/' ? '/' : ''}`;
}


export function getSiteDisplayName() {
    return getSite().displayName;
}


export function getSitePath() {
    return getSite()._path;
}


export function getNearestContentByType(content, type) {
    //log.info(`getNearestContentByType()`);
    const query = and(
        propEq('type', `${app.name}:${type}`),
        pathMatch('_path', `/content${content._path}`)
    ); //log.info(`getNearestContentByType query:${toStr(query)}`);
    const result = queryContent({
        query,
        start: 0,
        count: 1
    }); //log.info(`getNearestContentByType result:${toStr(result)}`);
    return result.total > 0 ? result.hits[0] : null;
} // export getNearestContentByType
