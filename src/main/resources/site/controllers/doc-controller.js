var libs = {
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content'),
    thymeleaf: require('/lib/xp/thymeleaf'),
};

exports.get = handleGet;

function handleGet(req) {
    var doc = libs.portal.getContent();

    var isPreview = isPreviewMode(req);

    if (isPreview) {
        var view = resolve('/site/pages/available-versions/available-versions.html');
        var model = {
            versions: getVersions(doc)
        };

        return {
            body: libs.thymeleaf.render(view, model),
            contentType: 'text/html; charset=UTF-8'
        }
    }
    else {
        var latestDocVersionId = doc.data.latest;

        if (!!latestDocVersionId) {
            var docVersionUrl = libs.portal.pageUrl({
                id: latestDocVersionId,
            });

            return {
                redirect: docVersionUrl
            };
        }

        return {
            body: '<div style="font-size: 21px;color: lightgray;top: 50%;text-align: center;width: 100%;position: absolute;margin-top: -20px;">No docs available</div>',
            contentType: 'text/html; charset=UTF-8'
        }
    }
}

function isPreviewMode(req) {
    return req.path.indexOf('preview') != 0;
}

function getVersions(doc) {
    var expr = "type = '" + app.name + ":docversion' AND _path LIKE '/content" + doc._path + "/*' ";

    var result = libs.content.query({
        query: expr,
        start: 0,
        count: 100
    });

    var versions = [];
    result.hits.forEach(function (version) {
        versions.push({
            label: version.displayName,
            isLatest: version._id == doc.data.latest,
            url: libs.portal.pageUrl({path: version._path})
        })
    });

    return versions;
}
