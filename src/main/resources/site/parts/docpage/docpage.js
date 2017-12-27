var libs = {
    thymeleaf: require('/lib/xp/thymeleaf'),
    portal: require('/lib/xp/portal'),
    doc: require('/lib/doc'),
    content: require('/lib/xp/content'),
    util: require('/lib/util')
}

exports.get = function (req) {
    var doc = getDoc();

    if (!doc) {
        return {
            body: '<div class="docpage-content"><h3 style="text-align: center">Your doc to be placed here</h3></div>',
            contentType: 'text/html'
        };
    }

    var model = createModel(doc);
    var view = resolve('docpage.html');

    return {
        body: libs.thymeleaf.render(view, model),
        contentType: 'text/html; charset=UTF-8'
    };
};

function getDoc() {
    var content = libs.portal.getContent();

    if (isDoc(content)) {
        return libs.content.get({key: content._path + '/index.html'});
    }

    return content;
};

function createModel(doc) {
    var model = {
        title: doc.data.title || doc.displayName,
        content: libs.portal.processHtml({value: doc.data.html}),
        isShowHeader: isHeaderShown(doc)
    };

    if (isGuide(doc)) {
        return model;
    }

    var serviceUrl = libs.portal.serviceUrl({
        service: 'search',
        params: {
            path: doc._path
        }
    });

    var rootDoc = getNearestContentByType(doc, 'doc');
    var versionContent = getNearestContentByType(doc, 'docversion');
    var versions = getVersions(rootDoc, versionContent);

    model.rootDocTitle = rootDoc.displayName;
    model.serviceUrl = serviceUrl;
    model.service = 'search';
    model.rootDocUrl = libs.portal.pageUrl({path: versionContent._path});
    model.versions = versions;

    return model;
}

function getNearestContentByType(content, type) {
    type = app.name + ':' + type;
    var expr = "type = '" + type + "'" + " AND pathMatch('_path', '/content" + content._path + "') ";

    var result = libs.content.query({
        query: expr,
        start: 0,
        count: 100
    });

    return result.hits[0];
}

function getVersions(rootDoc, currentVersion) {
    var expr = "type = '" + app.name + ":docversion' AND _path LIKE '/content" + rootDoc._path + "/*' ";

    var result = libs.content.query({
        query: expr,
        start: 0,
        count: 100
    });

    var versions = [];
    result.hits.forEach(function (version) {
        versions.push({
            label: version.displayName,
            isLatest: version.data.isLatest,
            isCurrent: version._id == currentVersion._id,
            url: libs.portal.pageUrl({path: version._path})
        })
    });

    return versions;
}

function isDocpage(content) {
    return content.type === app.name + ':docpage';
}

function isDoc(content) {
    return content.type === app.name + ':doc';
}

function isDocVersion(content) {
    return content.type === app.name + ':docversion';
}

function isGuide(content) {
    return content.type === app.name + ':guide';
}

function isHeaderShown(content) {
    return isDocpage(content) || isDocVersion(content);
}
