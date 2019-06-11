//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
import {search as searchDocs} from '/lib/doc';
import {newCache} from '/lib/cache';
import {RT_JSON} from '/content-types';

const cache = newCache({
    size: 10000,
    expire: 604800 // 1 week
});

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
export function get(req) {
    return {
        contentType: RT_JSON,
        body: cache.get(req.params.q, function () {
            return searchDocs(
                req.params.q,
                req.params.path,
                req.params.start,
                req.params.count
            );
        })
    }; // return
} // export get
