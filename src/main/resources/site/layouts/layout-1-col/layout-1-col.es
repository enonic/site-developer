//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/thymeleaf';
import {getComponent} from '/lib/xp/portal';
import {region} from '/lib/util';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW = resolve('layout-1-col.html'); // The view to render

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function createModel() {
    const model = {};
    const component = getComponent(); // Current component
    const bgColor = (component.config.bgColor || {}).themeColor;

    model.mainRegion = component.regions['main'];
    model.regions = region.get();
    model.component = component;
    model.layoutClass = 'layout-1-col' + (bgColor ? ' layout-1-col--' + bgColor : '');
    model.layoutClass += component.config.paddingTop ? ' layout-1-col--padding-top' : '';

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
