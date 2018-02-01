var libs = {
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    doc: require('/lib/doc')
};

exports.get = handleGet;

function handleGet(req) {
    var doc = libs.portal.getContent();

    var isPreview = isPreviewMode(req);

    if (isPreview) {
        var view = resolve('/site/pages/available-versions/available-versions.html');

        var model = {
            versions: getAvailableVersions(doc)
        };

        return {
            body: libs.thymeleaf.render(view, model),
            contentType: 'text/html; charset=UTF-8'
        }
    }
    else {
        var latestDocVersion = libs.doc.findLatestDocVersion(doc);

        if (!!latestDocVersion) {
            var docVersionUrl = libs.portal.pageUrl({
                id: latestDocVersion._id,
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
    return req.mode === 'preview';
}

function getAvailableVersions(doc) {
    var availableVersions = [];
    var docVersions = libs.doc.findDocVersions(doc);

    docVersions.forEach(function (docVersion) {
        availableVersions.push({
            label: docVersion.displayName,
            isLatest: docVersion.data.latest,
            url: libs.portal.pageUrl({path: docVersion._path})
        })
    });

    return availableVersions;
}

