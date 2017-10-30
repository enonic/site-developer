var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    content: require('/lib/xp/content'),
    util: require('/lib/enonic/util'),
    market: require('/lib/enonic/market')
};

// Handle GET request
exports.get = handleGet;

function handleGet(req) {
    var view = resolve('vendor-show.html');
    var model = createModel();

    function createModel() {

        var model = {};

        model.vendor = libs.portal.getContent();

        model.count = (req.params.c == parseInt(req.params.c, 10)) ? req.params.c : 20;
        model.start = (req.params.s == parseInt(req.params.s, 10)) ? req.params.s : 0;
        model.itemsOnly = req.params.preq ? true : false;

        var software = getSoftware(model.vendor._id, model.count, model.start);

        model.software = software.hits;

        model.pagination = {
            url: libs.portal.componentUrl({
                params: {
                    preq: true
                }
            }),
            count: model.count,
            start: model.start,
            total: software.total
        };

        //log.info('UTIL log %s', JSON.stringify(model, null, 4));

        return model;
    }

    function getSoftware(vendorId, count, start) {
        var software = libs.content.query({
            query: "data.vendor = '" + vendorId + "'",
            count: count,
            start: start,
            contentTypes: [
                app.name + ":application",
                app.name + ":library",
                app.name + ":starter"
            ],
            sort: 'displayName'
        });

        for (var i=0; i <software.hits.length; i++) {
            software.hits[i].softwareIcon = libs.market.getSoftwareIconUrl(software.hits[i]);
        }

        return software;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}