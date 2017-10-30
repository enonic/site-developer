var libs = {
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content')
};

exports.get = handleGet;

function handleGet(req) {
    var returnData = {};
    var ids;
    var searchTerm = req.params.q;
    var count = req.params.c || 10;
    var start = req.params.s || 0;

    if (req.params.ids) {
        try {
            ids = JSON.parse(req.params.ids) || [];
            log.info('Got ids: %s', ids);
        } catch (e) {
            log.warning('Invalid parameter ids: %s, using []', req.params.ids);
            ids = [];
        }
    }

    returnData.hits = getSoftware(searchTerm, count, start);

    function getSoftware(searchTerm, count, start) {
        var hits = [];
        var queryParams = {
            count: count,
            start: start,
            contentTypes: [
                app.name + ":application",
                app.name + ":library",
                app.name + ":starter",
                app.name + ":vendor"
            ]
        };
        if (ids && ids.length >= 0) {
            // 0 length may occur when ids param is incorrect
            var idString = ids.map(function (id) {
                return "\"" + id + "\""
            }).join(',');
            queryParams.query = '_name IN (' + idString + ')';
        } else if (searchTerm) {
            queryParams.query = "ngram('displayName', '" + searchTerm + "', 'AND') ";
        }
        var result = libs.content.query(queryParams);

        for (var i = 0; i < result.hits.length; i++) {
            var hit = result.hits[i];
            hits.push({
                name: hit.displayName,
                url: libs.portal.pageUrl({
                    id: hit._id
                }),
                desc: hit.data.shortDescription
            });
        }

        return hits;
    }

    return {
        contentType: 'text/json',
        body: returnData
    };
}