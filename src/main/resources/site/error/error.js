var libs = {
    thymeleaf: require('/lib/xp/thymeleaf'),
    portal: require('/lib/xp/portal')
};

exports.handle404 = function (err) {
    var view = resolve('page-not-found.html');
    var model = createModel();

    function createModel() {
        var model = {};
        var site = libs.portal.getSite(); // Current site
        model.sitePath = site['_path'];

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
        model.errorCode = err.status;
        model.errorMessage = err.message;

        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
};