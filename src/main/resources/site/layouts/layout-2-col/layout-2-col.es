//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/thymeleaf';
import {getComponent} from '/lib/xp/portal';
import {region} from '/lib/util';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW = resolve('layout-2-col.html'); // The view to render

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function createModel() {
    const model = {};
    const component = getComponent(); // Current component
    const bgColor = (component.config.bgColor || {}).themeColor;

    model.regions = region.get();
    model.component = component;
    model.layoutClass = 'layout-2-col' + (bgColor ? ' layout-2-col--' + bgColor : '');
    model.layoutClass += component.config.paddingTop ? ' layout-2-col--padding-top' : '';
    model.layoutClass += component.config.oneColMobile ? ' layout2-col--oneColMobile' : '';

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
