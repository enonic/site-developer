var libs = {
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content')
};

exports.get = handleGet;

function handleGet(req) {
    var doc = libs.portal.getContent();

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
