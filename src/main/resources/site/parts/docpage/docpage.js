var libs = {
    thymeleaf: require('/lib/xp/thymeleaf'),
    portal: require('/lib/xp/portal'),
    doc: require('/lib/doc'),
    util: require('/lib/util')
}

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

    return libs.doc.findEntry(key);
}

exports.get = function (req) {
    var book = findBook(req);
    if (!book) {
        return {
            body: '<div class="docpage-content"><h3 style="text-align: center">Your doc to be placed here</h3></div>',
            contentType: 'text/html'
        };
    }

    var model = {
        siteName: libs.util.getSiteDisplayName(),
        title: book.title,
        content: libs.portal.processHtml({ value: book.html }),
        baseUrl: libs.util.getSiteUrl()
    };

    var view = resolve('docpage.html');

    return {
        body: libs.thymeleaf.render(view, model),
        contentType: 'text/html; charset=UTF-8'
    };
};