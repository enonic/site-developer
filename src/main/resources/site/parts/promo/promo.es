//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/thymeleaf';
import {getComponent} from '/lib/xp/portal'
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {getSiteUrl} from '/lib/util';

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW_FILE = resolve('promo.html');
const RT_HTML = 'text/html; charset=UTF-8';

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
export function get() {
    const component = getComponent();

    const model = {
        ctaUrl: component.config.ctaUrl || '#ctaUrl-missing',
        ctaText: component.config.ctaText || '[CTA text]',
        description: component.config.description || '',
        color: component.config.color || 'green'
    };

    return {
        body: render(VIEW_FILE, model),
        contentType: RT_HTML
    };
}
