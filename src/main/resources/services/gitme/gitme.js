// Handle github's webhook post.

var nashornUtil = require('/lib/nashornUtil');
var contextLib = require('/lib/xp/context');
var contentLib = require('/lib/xp/content');
var docLib = require('/lib/doc');

var repoDest = './docs-repos/';

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

function unmarkLatest(params) {
    return sudo(docLib.unmarkLatest.bind(null, params));
}

function markLatest(doc, checkout) {
    return sudo(docLib.markLatest.bind(null, doc, checkout));
}

function setLatestOnContent(content, latest) {
    return sudo(docLib.setLatestOnContent.bind(null, content, latest));
}

exports.post = function (req) {
    callExecuteAsync(req);
    return;
};

function callExecuteAsync(req) {
    nashornUtil.setTimeout(function () { // making all activity async
        execute(req)
    }, 0);
}

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

    cloneMaster(repo);
    buildMaster(repo);
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

    log.info('Docs found from repo "' + repoUrl + '" - ' + result.total);

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

    removeUnusedVersions(docs, versions);
    unmarkLatestDocs(docs);

    if (versions.length == 0) {
        importMaster(repo, docs);
    }
    else {
        buildAndImportVersions(repo, docs, versions);
    }

    markLatestDocs(docs, versions);
}

function removeUnusedVersions(docs, versions) {
    docs.forEach(function (doc) {
        doRemoveUnusedVersions(doc, versions);
    });
}

function doRemoveUnusedVersions(doc, versions) {
    var docVersions = findVersions(doc);
    docVersions.forEach(function (docVersion) {
        var isUsed = versions.some(function (version) {
            return version.checkout == docVersion.data.checkout;
        });

        if (!isUsed) {
            log.info('Removing ' + doc.displayName + ' : ' + docVersion.displayName)
            removeContent({key: docVersion._id});
        }
    });
}

function findVersions(doc) {
    var expr = "type = '" + app.name + ":docversion' AND _path LIKE '/content" + doc._path + "/*' ";

    var result = queryContent({
        query: expr,
        start: 0,
        count: 100
    });

    return result.hits;
}

function unmarkLatestDocs(docs) {
    docs.forEach(function (doc) {
        unmarkLatest(doc);
    });
}

function markLatestDocs(docs, versions) {
    docs.forEach(function (doc) {
        markLatest(doc, getLatestCheckout(versions));
    });
}

function getLatestCheckout(versions) {
    var checkout = 'master';
    versions.some(function (version) {
        if (version.latest) {
            checkout = version.checkout;
        }
        return version.latest;
    });

    return checkout;
}

function buildAndImportVersions(repo, docs, versions) {
    defineLatestVersion(versions);

    versions.forEach(function (version) {
        var docsToImportVersionTo = getDocsToImportVersionTo(docs, version);

        if (docsToImportVersionTo.length > 0) {
            cloneRepo(repo, version.checkout);
            buildAsciiDoc(repo);

            docsToImportVersionTo.forEach(function (doc) {
                importDoc(repo, doc, version.checkout, version.label);
            });
        }
    });
}

function importMaster(repo, docs) {
    docs.forEach(function (doc) {
        importDoc(repo, doc, 'master', 'latest');
    });
}

function getDocsToImportVersionTo(docs, version) {
    var docsToImport = [];

    docs.forEach(function (doc) {
        var docVersions = findVersions(doc);
        var isUsed = docVersions.some(function (docVersion) {
            return version.checkout == docVersion.data.checkout;
        });

        if (!isUsed) {
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

function cloneRepo(repo, checkout) {
    var bean = __.newBean('com.enonic.site.developer.tools.repo.CloneRepoCommand');
    bean.repository = repo.html_url;
    bean.destination = repoDest + repo.full_name;
    bean.repoName = repo.full_name;
    if (!!checkout) {
        bean.checkout = checkout;
    }
    bean.execute();
}

function buildAsciiDoc(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.asciidoc.BuildAsciiDocCommand');
    bean.sourceDir = repoDest + repo.full_name + '/docs';
    bean.repoName = repo.full_name;
    bean.execute();
}

function importGuide(repo, guide) {
    var bean = __.newBean('com.enonic.site.developer.tools.imports.ImportGuideCommand');
    bean.sourceDir = repoDest + repo.full_name + '/docs';
    bean.importPath = guide._path.replace('/content', '');
    bean.execute();
}

function importDoc(repo, doc, checkout, label) {
    var bean = __.newBean('com.enonic.site.developer.tools.imports.ImportDocCommand');
    bean.sourceDir = repoDest + repo.full_name + '/docs';
    bean.importPath = doc._path.replace('/content', '');
    bean.checkout = !!checkout ? checkout : null;
    if (!!label) {
        bean.label = label;
    }
    bean.execute();
}

function getDocVersions(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.imports.GetVersionsCommand');
    bean.sourceDir = repoDest + repo.full_name + '/docs';
    var versionsJson = JSON.parse(__.toNativeObject(bean.execute()));

    if (!versionsJson || !versionsJson.versions || versionsJson.versions.length == 0) {
        return [];
    }

    return versionsJson.versions;
}