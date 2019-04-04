//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/thymeleaf';
import {getComponent} from '/lib/xp/portal';
import {region} from '/lib/util';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW = resolve('layout-3-col.html'); // The view to render

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function createModel() {
    const model = {};
    const component = getComponent(); // Current component
    const bgColor = (component.config.bgColor || {}).themeColor;

    model.regions = region.get();
    model.component = component;
    model.layoutClass = 'layout-3-col' + (bgColor ? ' layout-3-col--' + bgColor : '');
    model.layoutClass += component.config.paddingTop ? ' layout3-col--padding-top' : '';
    model.layoutClass += component.config.oneColMobile ? ' layout3-col--oneColMobile' : '';

    return model;
}

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.get = handleGet;

function handleGet(req) {
    var model = createModel();

    return {
        body: render(VIEW, model)
    };
}
