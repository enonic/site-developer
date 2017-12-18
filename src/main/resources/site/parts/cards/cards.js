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
    else {
        cards = searchCards();
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
        return null;
    }

    if (Array.isArray(obj)) {
        return obj;
    }

    return [obj];
}

function searchCards() {
    var content = libs.portal.getContent();

    var expr = "(type ='" + app.name + ":doc' OR type ='" + app.name + ":guide') " +
               "AND _path LIKE '/content" + content._path + "/*' ";

    var result = libs.content.query({
        query: expr,
        start: 0,
        count: 100
    });

    var cards = [];
    for (var i = 0; i < result.hits.length; i++) {
        var hit = result.hits[i];
        cards.push(createCard(libs.content.get({key: hit._path})));
    }

    return cards;
}