//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/thymeleaf';
import {getSitePath, getSiteUrl} from '/lib/siteUtil';

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function create404Model() {
    const model = {};

    // Used directly in view
    model.frontPageUrl = getSiteUrl();

    // Used in fragments (not mentioned in view)
    model.sitePath = getSitePath();

    return model;
}

function createErrorModel() {
    const model = {};

    // Used directly in view
    model.errorCode = err.status;
    model.errorMessage = err.message;

    // Used in fragments (not mentioned in view)
    model.sitePath = getSitePath();

    return model;
}

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.handle404 = function (err) {
    const view = resolve('page-not-found.html');
    const model = create404Model();

    return {
        body: render(view, model)
    };
};

exports.handleError = function (err) {
    const debugMode = err.request.params.debug === 'true';
    if (debugMode && err.request.mode === 'preview') {
        return;
    }

    const view = resolve('error.html');
    const model = createErrorModel();

    return {
        body: render(view, model)
    };
};
