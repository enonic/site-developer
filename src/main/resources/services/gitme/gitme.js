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

function createContent(params) {
    return sudo(contentLib.create.bind(null, params));
}

function getContent(params) {
    return sudo(contentLib.get.bind(null, params));
}

function modifyContent(params) {
    return sudo(contentLib.modify.bind(null, params));
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
    var docs = findDocs(repo.html_url);

    if (docs.length == 0) {
        return;
    }

    buildAndImportMasterVersion(repo, docs);
    buildAndImportOtherVersions(repo, docs);
}

function getRepoInfo(req) {
    var reqBodyJson = JSON.parse(req.body);
    return reqBodyJson.repository;
}

// Find all entry keys.
function findDocs(repoUrl) {
    var expr = "type ='" + app.name + ":doc' AND data.repository = '" + repoUrl + "'";

    var result = queryContent({
        query: expr,
        start: 0,
        count: 10000
    });

    log.info('Docs found from repo "' + repoUrl + '" - ' + result.total);

    var keys = [];
    for (var i = 0; i < result.hits.length; i++) {
        keys.push(result.hits[i]);
        log.info(result.hits[i]._id);
    }

    return keys;
};

function buildAndImportMasterVersion(repo, docs) {
    cloneRepo(repo);
    buildDoc(repo);

    docs.forEach(function (doc) {
        importDocs(repo, doc, 'beta');
    });
}

function buildAndImportOtherVersions(repo, docs) {
    var versions = getDocVersions(repo);

    if (!versions) {
        return;
    }

    versions.forEach(function (v) {
        cloneRepo(repo, v.checkout);
        buildDoc(repo);

        docs.forEach(function (doc) {
            importDocs(repo, doc, v.version);
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

function buildDoc(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.repo.BuildRepoCommand');
    bean.destination = repoDest + repo.full_name;
    bean.repoName = repo.full_name;
    bean.execute();
}

function importDocs(repo, doc, version) {
    var bean = __.newBean('com.enonic.site.developer.tools.imports.ImportLocalFilesCommand');
    bean.localPath = repoDest + repo.full_name + '/docs';
    bean.importPath = doc._path.replace('/content', '');
    if (!!version) {
        bean.version = version;
    }
    bean.execute();
}

function getDocVersions(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.imports.GetVersionsCommand');
    bean.localPath = repoDest + repo.full_name + '/docs';
    return JSON.parse(__.toNativeObject(bean.execute()));
}