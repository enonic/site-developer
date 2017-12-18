// Handle github's webhook post.

var nashornUtil = require('/lib/nashornUtil');
var contextLib = require('/lib/xp/context');
var contentLib = require('/lib/xp/content');

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

    cloneAndBuildMaster(repo);
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
        log.info(result.hits[i]._id);
    }

    return keys;
};

function cloneAndBuildMaster(repo) {
    cloneRepo(repo);
    buildAsciiDoc(repo);
}

function importGuides(repo) {
    var guides = findContentsLinkedToRepo(repo.html_url, 'guide');

    if (guides.length == 0) {
        return;
    }

    guides.forEach(function (guide) {
        importGuide(repo, guide);
    });
}

function importDocs(repo) {
    var docs = findContentsLinkedToRepo(repo.html_url, 'doc');

    if (docs.length == 0) {
        return;
    }

    var versions = getDocVersions(repo);

    importMasterVersion(repo, docs, !!versions);
    buildAndImportOtherVersions(repo, docs, versions);
}

function importMasterVersion(repo, docs, isMultiVersioned) {
    docs.forEach(function (doc) {
        importDoc(repo, doc, isMultiVersioned ? 'beta' : null);
    });
}

function buildAndImportOtherVersions(repo, docs, versions) {
    if (!versions) {
        return;
    }

    versions.forEach(function (v) {
        cloneRepo(repo, v.checkout);
        buildAsciiDoc(repo);

        docs.forEach(function (doc) {
            importDoc(repo, doc, v.version);
        });
    });
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

function importDoc(repo, doc, version) {
    var bean = __.newBean('com.enonic.site.developer.tools.imports.ImportDocCommand');
    bean.sourceDir = repoDest + repo.full_name + '/docs';
    bean.importPath = doc._path.replace('/content', '');
    if (!!version) {
        bean.version = version;
    }
    bean.execute();
}

function getDocVersions(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.imports.GetVersionsCommand');
    bean.sourceDir = repoDest + repo.full_name + '/docs';
    return JSON.parse(__.toNativeObject(bean.execute()));
}