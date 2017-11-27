// Handle github's webhook post.

var nashornUtil = require('/lib/nashornUtil');
var contextLib = require('/lib/xp/context');
var contentLib = require('/lib/xp/content');

var repoDest = './docs-repos/';
var branch = 'draft';

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
           importDoc(repo, doc);
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
    var bean = __.newBean('com.enonic.site.developer.tools.repo.GitRepoCloneCommand');
    bean.repository = repo.html_url;
    bean.destination = repoDest;
    bean.name = repo.full_name;
    bean.execute();
}

function buildDoc(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.doc.BuildDocCommand');
    bean.destination = repoDest;
    bean.name = repo.full_name;
    bean.execute();
    log.info('build done');
}

function importDoc(repo, docContent) {
    var docData = extractHtml(repo);
    updateDoc(docContent, docData);
}

function extractHtml(repo) {
    var bean = __.newBean('com.enonic.site.developer.tools.doc.HtmlExtractorCommand');
    bean.path = repoDest + repo.full_name + '/build/docs/html5/index.html';
    return __.toNativeObject(bean.execute());
}

// Update docpage
function updateDoc(doc, docData) {
    var docPage = getContent({
        key: doc._path + '/index.html',
        branch: branch
    });

    if (docPage) {
        log.info('updating ' + doc._name + '/index.html...');
        modifyContent({
            key: docPage._path,
            branch: branch,
            requireValid: false,
            editor: function (old) {
                old.data.html = docData.html;
                //old.data.raw = docData.text; //requireValid=false doesn't seem to work
                return old;
            }
        });
        log.info('index.html updated');
    } else {
        log.info('creating' + doc._name  + '/index.html...');
        createContent({
            name: 'index.html',
            parentPath: doc._path,
            displayName: 'index.html',
            contentType: app.name + ':docpage',
            branch: branch,
            requireValid: false,
            data: {
                html: docData.html,
                // raw: docData.text
            }
        });
        log.info('index.html created');
    }
};