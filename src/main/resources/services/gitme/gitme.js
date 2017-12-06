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
    var reqBodyJson = JSON.parse(req.body);
    var repo = reqBodyJson.repository;
    var repoUrl = repo.html_url;
    var docs = findDocs(repoUrl);

    if (docs.length > 0) {
        cloneRepo(repo);
        buildDoc(repo);
        docs.forEach(function (doc) {
           importDocs(repo, doc);
        });
    }
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

function cloneRepo(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.repo.CloneRepoCommand');
    bean.repository = repo.html_url;
    bean.destination = repoDest + repo.full_name;
    bean.repoName = repo.full_name;
    bean.execute();
}

function buildDoc(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.repo.BuildRepoCommand');
    bean.destination = repoDest + repo.full_name;
    bean.repoName = repo.full_name;
    bean.execute();
}

function importDocs(repo, doc) {
    var bean = __.newBean('com.enonic.site.developer.tools.imports.ImportLocalFilesCommand');
    bean.localPath = repoDest + repo.full_name + '/build/docs/html5';
    bean.importPath = doc._path.replace('/content', '');
    bean.execute();
}
