//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {getContent as getCurrentContent, pageUrl, serviceUrl} from '/lib/xp/portal';
import {render} from '/lib/thymeleaf';
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {findDocVersions, findLatestDocVersion} from '/lib/doc';


//──────────────────────────────────────────────────────────────────────────────
// Private Constants
//──────────────────────────────────────────────────────────────────────────────
const RT_HTML = 'text/html; charset=UTF-8';

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function isInlineMode(req) {
    return req.mode === 'inline';
}

function getAvailableVersions(doc) {
    const availableVersions = [];
    const docVersions = findDocVersions(doc);

    docVersions.forEach((docVersion) => {
        availableVersions.push({
            label: docVersion.displayName,
            isLatest: docVersion.data.latest,
            url: pageUrl({path: docVersion._path})
        })
    });

    return availableVersions;
}

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.get = function (req) {
    const doc = getCurrentContent();

    const isInline = isInlineMode(req);

    if (isInline) {
        const view = resolve('/site/pages/available-versions/available-versions.html');

        const model = {
            versions: getAvailableVersions(doc),
            repoUrl: doc.data.repository,
            docUrl: pageUrl({path: doc._path}),
            webhookServiceUrl: serviceUrl({service: 'gitme'})
        };

        return {
            body: render(view, model),
            contentType: RT_HTML
        }
    }
    else {
        const latestDocVersion = findLatestDocVersion(doc);

        if (!!latestDocVersion) {
            const docVersionUrl = pageUrl({
                id: latestDocVersion._id,
            });

            return {
                redirect: docVersionUrl
            };
        }

        return {
            body: '<div style="font-size: 21px;color: lightgray;top: 50%;text-align: center;width: 100%;position: absolute;margin-top: -20px;">No docs available</div>',
            contentType: RT_HTML
        }
    }
}
