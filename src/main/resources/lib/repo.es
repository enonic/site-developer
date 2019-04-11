//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {query as queryContent} from '/lib/xp/content';
import {run} from '/lib/xp/context';
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {and, propEq, propIn} from '/lib/query'
import {APP_NAME, CT_DOC, CT_GUIDE} from '/content-types';

//──────────────────────────────────────────────────────────────────────────────
// Private Constants
//──────────────────────────────────────────────────────────────────────────────
const DRAFT_BRANCH = 'draft';

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.isRepoReferencedByAnyContent = function (repoUrl) {
    const expr = and(
        propIn('type', [CT_DOC, CT_GUIDE]),
        propEq('data.repository', repoUrl)
    );

    const result = run({
        branch: DRAFT_BRANCH
    }, () => {
        return queryContent({
            query: expr,
            start: 0,
            count: 0
        });
    });

    log.info('Docs and guides referencing repo "' + repoUrl + '" - ' + result.total);

    return result.total > 0;
};

exports.findContentsLinkedToRepo = function (repoUrl, contentType) {
    const expr = and(
        propEq('type', APP_NAME + ":" + contentType),
        propEq('data.repository', repoUrl)
    );

    const result = run({
        branch: DRAFT_BRANCH
    }, () => {
        return queryContent({
            query: expr,
            start: 0,
            count: 10000
        });
    });

    const keys = [];
    for (let i = 0; i < result.hits.length; i++) {
        keys.push(result.hits[i]);
    }

    return keys;
};
