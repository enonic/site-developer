//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/thymeleaf';
import {getComponent} from '/lib/xp/portal';
import {region} from '/lib/util';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW = resolve('layout-doc.html'); // The view to render

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function createModel() {
    const model = {};
    const component = getComponent(); // Current component

    model.mainRegion = component.regions['main'];
    model.regions = region.get();
    model.component = component;

    return model;
}

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.get = handleGet;

function handleGet(req) {
    return {
        body: render(VIEW, createModel())
    };
}
