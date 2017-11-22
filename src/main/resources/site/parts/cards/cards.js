var libs = {
    thymeleaf: require('/lib/xp/thymeleaf'),
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content'),
    util: require('/lib/util')
}

exports.get = function (req) {


    var model = {
        cards: getCards()
    };

    var view = resolve('cards.html');

    return {
        body: libs.thymeleaf.render(view, model),
        contentType: 'text/html; charset=UTF-8'
    };
};

function getCards() {
    var docIds = asArray(libs.portal.getComponent().config.cards); // Current component
    var cards = [];

    if (docIds) {
        docIds.forEach(function(id) {
            cards.push(createCard(libs.content.get({key: id})));
        });
    }

    return cards;
}

function createCard(content) {
    return {
        title: content.displayName,
        text: content.data.shortdescription || 'Mock text', //content.data.raw.substr(0, 128) + '...',
        tags: content.data.tags || [],
        url: libs.util.getSiteUrl() + content._path.replace(libs.util.getSitePath() + '/', '')
    }
}

function asArray(obj) {
    if (!obj) {
        return [];
    }

    if (Array.isArray(obj)) {
        return obj;
    }

    return [obj];
}