//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/xp/thymeleaf';
import {getSite as getCurrentSite, serviceUrl} from '/lib/xp/portal';
import {get as getContent} from '/lib/xp/content'
import {getMenuTree} from '/lib/enonic/menu'
import {toStr} from '/lib/enonic/util'
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {getContentParent, getSiteUrl} from '/lib/util'
import {search as searchDocs} from '/lib/doc'

//──────────────────────────────────────────────────────────────────────────────
// Private Constants
//──────────────────────────────────────────────────────────────────────────────
const DEBUG = false;
const VIEW_FILE = resolve('/site/pages/search-result/search-result.html');
const EMPTY_RESULT = {count: 0, total: 0, hits: []};
const RT_HTML = 'text/html; charset=UTF-8';

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function getDocToSearchIn(req) {
    const docId = req.params.doc;

    if (!docId) {
        return null;
    }

    return getContent({key: docId});
}

function getSearchPath(docToSearchIn) {
    if (!docToSearchIn) {
        return null;
    }

    return docToSearchIn._path;
}

function generateServiceUrl(docToSearchIn) {
    if (docToSearchIn) {
        return serviceUrl({
            service: 'search',
            params: {
                path: docToSearchIn._path
            }
        })
    }

    return serviceUrl({service: 'search'});
}

function getIdOfDocToSearchIn(docToSearchIn) {
    if (!docToSearchIn) {
        return null;
    }

    return docToSearchIn._id;
}

function getFilterText(docToSearchIn) {
    if (!docToSearchIn) {
        return null;
    }

    const doc = getContentParent(docToSearchIn);
    return doc.displayName + ' (' + docToSearchIn.displayName + ')';
}

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.get = function (req) {
    const currentSite = getCurrentSite();
    const docToSearchIn = getDocToSearchIn(req);
    const searchPath = getSearchPath(docToSearchIn);

    const model = {

        // Used directly in view
        searchResult: req.params.q
            ? searchDocs(req.params.q, searchPath, req.params.start, req.params.count)
            : EMPTY_RESULT,
        filterText: getFilterText(docToSearchIn),

        // Used in fragments (not mentioned in view)
        menuItems: getMenuTree(3),
        pageTitle: 'Search result',
        searchDocId: getIdOfDocToSearchIn(docToSearchIn),
        searchResultPageUrl: getSiteUrl() + 'search',
        serviceUrl: generateServiceUrl(docToSearchIn),
        showHeaderSearch: false,
        siteName: currentSite.displayName,
        sitePath: currentSite['_path'],
        searchQuery: req.params.q

    }; // model
    DEBUG && log.info('model:' + toStr(model));

    return {
        body: render(VIEW_FILE, model),
        contentType: RT_HTML
    };
} // get
