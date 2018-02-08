//──────────────────────────────────────────────────────────────────────────────
// Imports: Enonic XP libs (build.gradle)
//──────────────────────────────────────────────────────────────────────────────
import {render} from '/lib/xp/thymeleaf';
import {getComponent, getContent as getCurrentContent} from '/lib/xp/portal';
import {get as getContent, query} from '/lib/xp/content'
//──────────────────────────────────────────────────────────────────────────────
// Imports: Application libs
//──────────────────────────────────────────────────────────────────────────────
import {getSitePath, getSiteUrl} from '/lib/util'

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const VIEW = resolve('cards.html'); // The view to render
const RT_HTML = 'text/html; charset=UTF-8';

//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function getCards() {
    const docIds = asArray(getComponent().config.cards); // Current component
    let cards = [];

    if (docIds) {
        docIds.forEach((id) => {
            cards.push(createCard(getContent({key: id})));
        });
    }
    else {
        cards = searchCards();
    }

    return cards;
}

function createCard(content) {
    return {
        title: content.displayName,
        text: content.data.shortdescription || 'Mock text', //content.data.raw.substr(0, 128) + '...',
        tags: content.data.tags,
        image: content.data.image,
        url: getSiteUrl() + content._path.replace(getSitePath() + '/', '')
    }
}

function asArray(obj) {
    if (!obj) {
        return null;
    }

    if (Array.isArray(obj)) {
        return obj;
    }

    return [obj];
}

function searchCards() {
    const content = getCurrentContent();

    const expr = "(type ='" + app.name + ":doc' OR type ='" + app.name + ":guide') " +
               "AND _path LIKE '/content" + content._path + "/*' ";

    const result = query({
        query: expr,
        start: 0,
        count: 100
    });

    const cards = [];

    for (let i = 0; i < result.hits.length; i++) {
        const hit = result.hits[i];
        cards.push(createCard(getContent({key: hit._path})));
    }

    return cards;
}

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.get = function (req) {
    const model = {
        cards: getCards()
    };

    return {
        body: render(VIEW, model),
        contentType: RT_HTML
    };
};
