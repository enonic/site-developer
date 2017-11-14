var libs = {
    thymeleaf: require('/lib/xp/thymeleaf'),
    util: require('/lib/util')
}


exports.get = function (req) {

    var model = {
        linkDocs: libs.util.getSiteUrl() + 'docs',
        linkGuides: libs.util.getSiteUrl() + 'guides'
    };

    var view = resolve('promo.html');

    return {
        body: libs.thymeleaf.render(view, model),
        contentType: 'text/html; charset=UTF-8'
    };
};