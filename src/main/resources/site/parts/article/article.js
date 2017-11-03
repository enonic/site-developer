var docLib = require('/lib/doc');
var thymeleafLib = require('/lib/xp/thymeleaf');
var util = require('/lib/util');

function findKey(req) {
    var path = req.path;
    var re = new RegExp('/.+/([^/]+)/([^/]+)');
    var result = re.exec(path);

    if (!result) {
        return;
    }

    return {
        category: result[1],
        name: result[2]
    }
}

function findBook(req) {
    var key = findKey(req);

    if (!key) {
        return;
    }

    return docLib.findEntry(key);
}

exports.get = function (req) {
    var book = findBook(req);
    if (!book) {
        return {
            body: '<div><h3>Your doc to be placed here</h3></div>',
            contentType: 'text/html'
        };
    }

    var model = {
        siteName: util.getSiteDisplayName(),
        title: book.title,
        content: book.html,
        socialLinks: util.getSocialLinks(),
        baseUrl: util.getSiteUrl()
    };

    var view = resolve('article.html');

    return {
        body: thymeleafLib.render(view, model),
        contentType: 'text/html; charset=UTF-8'
    };
};