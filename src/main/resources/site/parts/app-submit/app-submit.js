var libs = {
    portal : require('/lib/xp/portal'),
    thymeleaf : require('/lib/xp/thymeleaf')
};

// Handle GET request
exports.get = handleGet;

function handleGet(req) {
    var view = resolve('app-submit.html');
    var model = createModel();

    function createModel() {
        var model = {};
        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}