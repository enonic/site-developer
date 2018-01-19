import {serviceUrl as getServiceUrl} from '/lib/xp/portal';

var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    util: require('/lib/util')
};

exports.get = handleGet;

function handleGet(req) {
    var view = resolve('search.html');
    var model = createModel();

    function createModel() {
        var model = {};

        model.searchResultPageUrl = libs.util.getSiteUrl() + 'search';

        model.serviceUrl = getServiceUrl({
            service: 'search'
        });

        model.showHeaderSearch = true;

        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}
