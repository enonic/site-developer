// Handle github's webhook post.

var contextLib = require('/lib/xp/context');
var contentLib = require('/lib/xp/content');
var docLib = require('/lib/doc');
var taskLib = require('/lib/xp/task');

var REPO_DEST = './docs-repos/';
var DOCS_PATH = '/docs';
var MASTER_BRANCH = 'master';
var DRAFT_BRANCH = 'draft';

function sudo(callback) {
    return contextLib.run({
        principals: ['role:system.admin'],
        user: {
            login: 'su'
        }
    }, callback);
}

function queryContent(params) {
    return sudo(contentLib.query.bind(null, params));
}

function removeContent(params) {
    return sudo(contentLib.delete.bind(null, params));
}

function getContent(params) {
    return sudo(contentLib.get.bind(null, params));
}

function publish(params) {
    return sudo(contentLib.publish.bind(null, params));
}

function unmarkLatest(params) {
    return sudo(docLib.unmarkLatest.bind(null, params));
}

function markLatest(doc, checkout) {
    return sudo(docLib.markLatest.bind(null, doc, checkout));
}

function setLatestOnContent(content, latest) {
    return sudo(docLib.setLatestOnContent.bind(null, content, latest));
}

function findChildren(content) {
    return sudo(docLib.findChildren.bind(null, content));
}

function importGuide(repo, guide) {
    return sudo(doImportGuide.bind(null, repo, guide));
}

function importDoc(repo, doc, commit, label) {
    return sudo(doImportDoc.bind(null, repo, doc, commit, label));
}

exports.post = function (req) {

    taskLib.submit({
        description: 'Site Developer: GitHub Webhook',
        task: function () {
            execute(req);
        }
    });

    return;
};

function execute(req) {
    try {
        doExecute(req);
        log.info('Import done!');
    }
    catch (e) {
        log.error(e);
    }
}

function doExecute(req) {
    var repo = getRepoInfo(req)

    if (!isRepoReferencedByAnyContent(repo.html_url)) {
        return;
    }

    importGuides(repo);
    importDocs(repo);
}

function getRepoInfo(req) {
    var reqBodyJson = JSON.parse(req.body);
    return reqBodyJson.repository;
}

function isRepoReferencedByAnyContent(repoUrl) {
    var expr = "(type ='" + app.name + ":doc' OR type ='" + app.name + ":guide' ) AND data.repository = '" + repoUrl + "'";

    var result = queryContent({
        query: expr,
        start: 0,
        count: 0
    });

    log.info('Docs and guides referencing repo "' + repoUrl + '" - ' + result.total);

    return result.total > 0;
};

function findContentsLinkedToRepo(repoUrl, contentType) {
    var expr = "type ='" + app.name + ":" + contentType + "' AND data.repository = '" + repoUrl + "'";

    var result = queryContent({
        query: expr,
        start: 0,
        count: 10000
    });

    var keys = [];
    for (var i = 0; i < result.hits.length; i++) {
        keys.push(result.hits[i]);
    }

    return keys;
};

function cloneMaster(repo) {
    cloneRepo(repo);
}

function buildMaster(repo) {
    buildAsciiDoc(repo);
}

function importGuides(repo) {
    var guides = findContentsLinkedToRepo(repo.html_url, 'guide');

    if (guides.length == 0) {
        return;
    }

    cloneMaster(repo);
    buildMaster(repo);

    guides.forEach(function (guide) {
        importGuide(repo, guide);
        setLatestOnContent(guide, true);
    });
}

function importDocs(repo) {
    var docs = findContentsLinkedToRepo(repo.html_url, 'doc');

    if (docs.length == 0) {
        return;
    }

    var versions = getDocVersions(repo);

    unmarkLatestDocs(docs);
    defineLatestVersion(versions);
    buildAndImportVersions(repo, docs, versions);
    removeUnusedVersions(docs, versions);
    markLatestDocs(docs, versions);
}

function removeUnusedVersions(docs, versions) {
    docs.forEach(function (doc) {
        doRemoveUnusedVersions(doc, versions);
    });
}

function doRemoveUnusedVersions(doc, versions) {
    var docVersions = docLib.findDocVersions(doc);
    docVersions.forEach(function (docVersion) {
        var isInVersionsJson = versions.some(function (version) {
            return version.commit == docVersion.data.commit;
        });

        if (!isInVersionsJson) {
            log.info('Removing ' + doc.displayName + ' : ' + docVersion.displayName);
            var isDocVersionPublished = isContentPublished(docVersion);
            removeContent({key: docVersion._id});
            if (isDocVersionPublished) {
                publishTree(docVersion);
            }
        }
    });
}

function unmarkLatestDocs(docs) {
    docs.forEach(function (doc) {
        unmarkLatest(doc);
    });
}

function markLatestDocs(docs, versions) {
    var latestCheckout = getLatestCheckout(versions);

    docs.forEach(function (doc) {
        markLatest(doc, latestCheckout);
    });
}

function getLatestCheckout(versions) {
    var checkout = 'master';

    versions.some(function (version) {
        if (version.latest) {
            checkout = version.commit;
        }
        return version.latest;
    });

    return checkout;
}

function buildAndImportVersions(repo, docs, versions) {
    var branches = getBranches(repo);

    versions.forEach((version) => {
        var commitId = getCommitId(version.checkout, branches);
        version.commit = commitId;

        var docsToImportVersionTo = getDocsToImportVersionTo(docs, commitId);

        if (docsToImportVersionTo.length > 0) {
            cloneRepo(repo, version.checkout);
            buildAsciiDoc(repo);
        }

        docsToImportVersionTo.forEach((doc) => {
            const importedContentsIds = importDoc(repo, doc, commitId, version.label);
            const docVersion = docLib.findDocVersionByCheckout(doc, commitId);
            removeOldContentsFromDoc(docVersion, importedContentsIds);

            if (isContentPublished(docVersion)) {
                publishTree(docVersion);
            }
        });
    });
}

// idea is that checkout is rather branch name or commit id, checking if checkout is in branches list
function getCommitId(checkout, branches) {
    var result = checkout;

    branches.some(function (branch) {
        if (branch.name == checkout) {
            result = branch.id;
            return true;
        }
        else {
            return false;
        }
    });

    return result;
}

function getDocsToImportVersionTo(docs, commitId) {
    var docsToImport = [];

    docs.forEach(function (doc) {
        var docVersions = docLib.findDocVersions(doc);
        var isUpToDate = docVersions.some(function (docVersion) {
            return commitId == docVersion.data.commit;
        });

        if (!isUpToDate) {
            docsToImport.push(doc);
        }
    });

    return docsToImport;
}

function defineLatestVersion(versions) {
    var isLatestRegExp = /^true$/i;

    var isLatestSpecified = false;

    versions.forEach(function (version) {
        version.latest = isLatestRegExp.test(version.latest);
        if (!!version.latest) {
            isLatestSpecified = true;
        }
    });

    if (!isLatestSpecified) {
        versions[0].latest = true;
    }
}

function removeOldContentsFromDoc(docVersion, importedContentsIds) {
    const contents = findChildren(docVersion);

    contents.forEach(function (content) {
        const isImportedContent = importedContentsIds.some((importedContentId) => importedContentId == content._id);

        if (!isImportedContent) {
            log.info('Removing ' + content._path);
            removeContent({key: content._id});
        }
    });
}

function isContentPublished(content) {
    return !!getContent({
        key: content._id,
        branch: MASTER_BRANCH
    })
}

function publishTree(content) {
    log.info('Publishing ' + content._path);

    publish({
        keys: [content._id],
        sourceBranch: DRAFT_BRANCH,
        targetBranch: MASTER_BRANCH
    })
}

function makeVersionsJsonWithMaster() {
    return [
        {
            "label": "latest",
            "checkout": "master",
            "latest": true
        }
    ];
}

function getBranches(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.repo.GetBranchesCommand');
    bean.repository = repo.html_url;

    var branches = __.toNativeObject(bean.execute());

    var result = [];

    branches.forEach(function (branchStr) {
        var branchArr = branchStr.split('=');
        result.push({
            name: branchArr[0],
            id: branchArr[1]
        });
    });

    return result;
}

function cloneRepo(repo, checkout) {
    var bean = __.newBean('com.enonic.site.developer.tools.repo.CloneRepoCommand');
    bean.repository = repo.html_url;
    bean.destination = REPO_DEST + repo.full_name;
    bean.repoName = repo.full_name;
    if (!!checkout) {
        bean.checkout = checkout;
    }

    return __.toNativeObject(bean.execute());
}

function buildAsciiDoc(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.asciidoc.BuildAsciiDocCommand');
    bean.sourceDir = REPO_DEST + repo.full_name + DOCS_PATH;
    bean.repoName = repo.full_name;

    bean.execute();
}

function doImportGuide(repo, guide) {
    var bean = __.newBean('com.enonic.site.developer.tools.imports.ImportGuideCommand');
    bean.sourceDir = REPO_DEST + repo.full_name + DOCS_PATH;
    bean.importPath = guide._path.replace('/content', '');

    return __.toNativeObject(bean.execute());
}

function doImportDoc(repo, doc, commit, label) {
    var bean = __.newBean('com.enonic.site.developer.tools.imports.ImportDocCommand');
    bean.sourceDir = REPO_DEST + repo.full_name + DOCS_PATH;
    bean.importPath = doc._path.replace('/content', '');
    bean.commit = commit;
    if (!!label) {
        bean.label = label;
    }

    return __.toNativeObject(bean.execute());
}

function getDocVersions(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.repo.GetVersionsCommand');
    bean.repository = repo.full_name;
    var versionsJson = JSON.parse(__.toNativeObject(bean.execute()));

    if (!versionsJson || !versionsJson.versions || versionsJson.versions.length == 0) {
        return makeVersionsJsonWithMaster();
    }

    return versionsJson.versions;
}
