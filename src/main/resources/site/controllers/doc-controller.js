var libs = {
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content')
};

exports.get = handleGet;

function handleGet(req) {

    var latestDocVersion = searchLatest();

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

function searchLatest() {
    var doc = libs.portal.getContent();

    var expr = "type ='" + app.name + ":docversion' " +
               "AND _path LIKE '/content" + doc._path + "/*' " +
               "AND data.isLatest = 'true'";

    var result = libs.content.query({
        query: expr,
        start: 0,
        count: 1
    });

    if (result.hits.length > 0) {
        return result.hits[0];
    }

    return null;
}