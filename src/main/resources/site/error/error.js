// Imports
var libs = {
    thymeleaf: require('/lib/xp/thymeleaf'),
    portal: require('/lib/xp/portal'),
    util: require('/lib/util')
};

// Functions
var getSiteUrl = libs.util.getSiteUrl;
var getSitePath = libs.util.getSitePath;

// Exports
exports.handle404 = function (err) {
    var view = resolve('page-not-found.html');
    var model = createModel();

    function createModel() {
        var model = {};

        // Used directly in view
        model.frontPageUrl = getSiteUrl();

        // Used in fragments (not mentioned in view)
        model.sitePath = getSitePath();

        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
};

exports.handleError = function (err) {
    var view = resolve('error.html');
    var model = createModel();

    var debugMode = err.request.params.debug === 'true';
    if (debugMode && err.request.mode === 'preview') {
        return;
    }

    function createModel() {
        var model = {};

        // Used directly in view
        model.errorCode = err.status;
        model.errorMessage = err.message;

        // Used in fragments (not mentioned in view)
        model.sitePath = getSitePath();

        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
};