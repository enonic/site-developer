//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {delete as deleteContent, get as getContent} from '/lib/xp/content';
import {run as runWithContext} from '/lib/xp/context';
import {list as listTasks, submit as submitTask} from '/lib/xp/task';
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {findChildren, findDocVersions, isPublished, markLatest, publishTree} from '/lib/doc';
import {findContentsLinkedToRepo, isRepoReferencedByAnyContent} from '/lib/repo'

//──────────────────────────────────────────────────────────────────────────────
// Private Constants
//──────────────────────────────────────────────────────────────────────────────
const REPO_DEST = './docs-repos/';
const DOCS_PATH = '/docs';
const MASTER_BRANCH = 'master';
const DRAFT_BRANCH = 'draft';
const GITHUB_URL = 'https://github.com/';

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function runTask(repo) {
    submitTask({
        description: repo.html_url,
        task: function () {
            sudo(execute.bind(null, repo));
        }
    });
}

function sudo(callback) {
    return runWithContext({
        principals: ['role:system.admin'],
        user: {
            login: 'su'
        },
        branch: DRAFT_BRANCH
    }, callback);
}

function isPreviewMode(req) {
    return req.mode === 'preview';
}

function execute(repo) {
    try {
        doExecute(repo);
    }
    catch (e) {
        log.error(e);
    }
}

function doExecute(repo) {
    if (!isRepoReferencedByAnyContent(repo.html_url)) {
        return;
    }

    importGuides(repo);
    importDocs(repo);

    log.info('Import done!');
}

function makeRepoObjFromUrl(repoUrl) {
    return {
        html_url: repoUrl,
        full_name: repoUrl.replace(GITHUB_URL, '')
    }
}

function cloneMaster(repo) {
    cloneRepo(repo);
}

function buildMaster(repo) {
    buildAsciiDoc(repo);
}

function importGuides(repo) {
    const guides = findContentsLinkedToRepo(repo.html_url, 'guide');

    if (guides.length === 0) {
        return;
    }

    cloneMaster(repo);
    buildMaster(repo);

    guides.forEach((guide) => {
        importGuide(repo, guide);

        if (isPublished(guide)) {
            publishTree(guide);
        }
    });
}

function importDocs(repo) {
    const docs = findContentsLinkedToRepo(repo.html_url, 'doc');

    if (docs.length === 0) {
        return;
    }

    const versions = getDocVersions(repo);

    buildAndImportVersions(repo, docs, versions);
    removeUnusedVersions(docs, versions);
    markLatestDocs(docs, versions);
}

function removeUnusedVersions(docs, versions) {
    docs.forEach((doc) => {
        doRemoveUnusedVersions(doc, versions);
    });
}

function doRemoveUnusedVersions(doc, versions) {
    const docVersions = findDocVersions(doc);

    docVersions.filter(docVersion => !isDocVersionUsed(docVersion, versions)).forEach((docVersion) => {
        log.info('Removing unused ' + doc.displayName + ' : ' + docVersion.displayName);
        doRemoveUnusedDocVersion(docVersion);
    });
}

function isDocVersionUsed(docVersion, versions) {
    return versions.some((version) => {
        return version.commitId === docVersion.data.commit;
    });
}

function doRemoveUnusedDocVersion(docVersion) {
    const isDocVersionPublished = isPublished(docVersion);

    deleteContent({key: docVersion._id, branch: DRAFT_BRANCH});

    if (isDocVersionPublished) {
        publishTree(docVersion);
    }
}

function markLatestDocs(docs, versions) {
    const latestCheckout = getLatestCheckout(versions);

    docs.forEach((doc) => {
        markLatest(doc, latestCheckout);
    });
}

function getLatestCheckout(versions) {
    let checkout = MASTER_BRANCH;

    versions.some((version) => {
        if (version.latest) {
            checkout = version.commitId;
        }
        return version.latest;
    });

    return checkout;
}

function buildAndImportVersions(repo, docs, versions) {
    versions.forEach((version) => {
        buildAndImportVersion(repo, docs, version);
    });
}

function buildAndImportVersion(repo, docs, version) {
    const docsToImportVersionTo = getDocsToImportVersionTo(docs, version.commitId);

    if (docsToImportVersionTo.length === 0) {
        return;
    }

    cloneRepo(repo, version.checkout);
    buildAsciiDoc(repo);

    docsToImportVersionTo.forEach((doc) => {
        importVersionIntoDoc(repo, doc, version);
    });
}

function getDocsToImportVersionTo(docs, commitId) {
    const docsToImport = [];

    docs.forEach((doc) => {
        if (!isUpToDate(doc, commitId)) {
            docsToImport.push(doc);
        }
    });

    return docsToImport;
}

function isUpToDate(doc, commitId) {
    const docVersions = findDocVersions(doc);
    const isUpToDate = docVersions.some((docVersion) => {
        return commitId === docVersion.data.commit;
    });

    return isUpToDate;
}

function importVersionIntoDoc(repo, doc, version) {
    const importedContentsIds = importDoc(repo, doc, version);
    const docVersion = getContent({
        key: importedContentsIds[0],
        branch: DRAFT_BRANCH
    });

    removeOldContentsFromDoc(docVersion, importedContentsIds);

    if (isPublished(doc)) {
        publishTree(docVersion);
    }
}

function removeOldContentsFromDoc(docVersion, importedContentsIds) {
    const docVersionContents = findChildren(docVersion);

    docVersionContents.filter(content => !isImportedContent(content._id, importedContentsIds)).forEach((content) => {
        log.info('Removing ' + content._path);
        deleteContent({key: content._id, branch: DRAFT_BRANCH});
    });
}

function isImportedContent(contentId, importedContentsIds) {
    return importedContentsIds.some((importedContentId) => importedContentId === contentId);
}

function cloneRepo(repo, checkout) {
    const bean = __.newBean('com.enonic.site.developer.tools.repo.CloneRepoCommand');
    bean.repository = repo.html_url;
    bean.destination = REPO_DEST + repo.full_name;
    bean.repoName = repo.full_name;
    if (!!checkout) {
        bean.checkout = checkout;
    }

    return __.toNativeObject(bean.execute());
}

function buildAsciiDoc(repo) {
    const bean = __.newBean('com.enonic.site.developer.tools.asciidoc.BuildAsciiDocCommand');
    bean.sourceDir = REPO_DEST + repo.full_name + DOCS_PATH;
    bean.repoName = repo.full_name;

    bean.execute();
}

function importGuide(repo, guide) {
    const bean = __.newBean('com.enonic.site.developer.tools.imports.ImportGuideCommand');
    bean.sourceDir = REPO_DEST + repo.full_name + DOCS_PATH;
    bean.importPath = guide._path.replace('/content', '');

    return __.toNativeObject(bean.execute());
}

function importDoc(repo, doc, version) {
    const bean = __.newBean('com.enonic.site.developer.tools.imports.ImportDocCommand');
    bean.sourceDir = REPO_DEST + repo.full_name + DOCS_PATH;
    bean.importPath = doc._path.replace('/content', '');
    bean.commit = version.commitId;
    if (!!version.label) {
        bean.label = version.label;
    }

    return __.toNativeObject(bean.execute());
}

function getDocVersions(repo) {
    const bean = __.newBean('com.enonic.site.developer.tools.repo.GetVersionsCommand');
    bean.repoName = repo.full_name;
    bean.repoUrl = repo.html_url;

    const versionsJson = JSON.parse(__.toNativeObject(bean.execute()));
    log.info('versions: ' + JSON.stringify(versionsJson));

    return versionsJson.versions;
}

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.post = function (req) {
    // in preview mode if triggered manually from page, thus repo url is in params and not in body
    const repo = isPreviewMode(req) ? makeRepoObjFromUrl(req.params.repository) : JSON.parse(req.body).repository;
    const isTaskAlreadyRunning = listTasks().some(task => task.description === repo.html_url && task.state === "RUNNING");

    if (isTaskAlreadyRunning) {
        log.info('Site Dev GitHub Webhook is already running!');
    }
    else {
        runTask(repo);
    }

    if (isPreviewMode(req)) { // for manually triggered webhook redirecting back to page where it was triggered
        return {
            redirect: req.params.docUrl
        };
    }
};
