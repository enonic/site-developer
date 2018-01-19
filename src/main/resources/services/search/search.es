//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
import {search as searchDocs} from '/lib/doc';
import {RT_JSON} from '/content-types';

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
export function get(req) {
    return {
        contentType: RT_JSON,
        body: searchDocs(
            req.params.q,
            req.params.path,
            req.params.start,
            req.params.count
        )
    }; // return
} // export get
