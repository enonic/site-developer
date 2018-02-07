var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    util: require('/lib/enonic/util')
};

// Handle GET request
exports.get = handleGet;

function handleGet(req) {
    var component = libs.portal.getComponent(); // Current component
    var view = resolve('layout-doc.html');
    var model = createModel();

    function createModel() {
        var model = {};

        model.mainRegion = component.regions['main'];
        model.regions = libs.util.region.get();
        model.component = component;

        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}