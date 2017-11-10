var thymeleafLib = require('/lib/xp/thymeleaf');

exports.get = function (req) {

    var model = {
    };

    var view = resolve('promo.html');

    return {
        body: thymeleafLib.render(view, model),
        contentType: 'text/html; charset=UTF-8'
    };
};