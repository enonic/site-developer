var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    content: require('/lib/xp/content'),
    market: require('/lib/enonic/market')
};

// Handle GET request
exports.get = handleGet;
exports.post = handleGet;

function handleGet(req) {
    var component = libs.portal.getComponent();
    var view = resolve('software-list.html');
    var model = createModel();

    function createModel() {
        var model = {};
        var xpVersion = req.params.xpVersion;

        model.heading = component.config.heading;
        model.preface = libs.portal.processHtml({
            value: component.config.preface
        });

        model.count = (req.params.c == parseInt(req.params.c, 10)) ? req.params.c : 20;
        model.start = (req.params.s == parseInt(req.params.s, 10)) ? req.params.s : 0;
        model.itemsOnly = req.params.preq ? true : false;


        var allSoftwareTypes = libs.market.getSoftwareTypes(true);
        var selectedSoftwareTypes = [];

        if (allSoftwareTypes.indexOf(app.name + ':' + component.config.softwareType) > -1) {
            selectedSoftwareTypes = [
                app.name + ':' + component.config.softwareType
            ];
        }
        else {
            selectedSoftwareTypes = allSoftwareTypes;
        }

        var software = libs.market.getSoftware(selectedSoftwareTypes, xpVersion, model.count, model.start);
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

    return {
        body: libs.thymeleaf.render(view, model)
    };
}