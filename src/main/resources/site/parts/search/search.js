var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    util: require('/lib/enonic/util')
};

exports.get = handleGet;

function handleGet(req) {
    var view = resolve('search.html');
    var model = createModel();

    function createModel() {
        var model = {};

        // var siteConfig = libs.portal.getSiteConfig();
        // var searchResultPage = siteConfig.searchResultPage;

        var searchResultPage = 'search'; // not implemented yet

        model.searchResultPageUrl = libs.portal.pageUrl({
            'id': searchResultPage
        });
        model.serviceUrl = libs.portal.serviceUrl({
            service: 'search'
        });

        return model;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}