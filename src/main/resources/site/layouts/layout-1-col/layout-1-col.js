var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    util: require('/lib/enonic/util')
};

// Handle GET request
exports.get = handleGet;

function handleGet(req) {
    var component = libs.portal.getComponent(); // Current component
    var view = resolve('layout-1-col.html');
    var model = createModel();

    function createModel() {
        var model = {};
        var bgColor = (component.config.bgColor || {}).themeColor;
        model.mainRegion = component.regions['main'];
        model.regions = libs.util.region.get();
        model.component = component;

        model.layoutClass = 'layout-1-col' + (bgColor ? ' layout-1-col--' + bgColor : '');
        model.layoutClass += component.config.paddingTop ? ' layout-1-col--padding-top' : '';
        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}