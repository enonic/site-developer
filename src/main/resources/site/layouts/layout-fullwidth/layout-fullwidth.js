var UTIL = require('/lib/enonic/util');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');

// Handle GET request
exports.get = handleGet;

function handleGet(req) {
    var component = portal.getComponent();
    var view = resolve('layout-fullwidth.html');
    var model = createModel();

    function createModel() {
        var model = {};
        model.regions = UTIL.region.get();
        return model;
    }

    return {
        body: thymeleaf.render(view, model)
    };
}