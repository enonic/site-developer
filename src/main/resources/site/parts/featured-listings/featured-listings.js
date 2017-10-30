var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    util: require('/lib/enonic/util'),
    market: require('/lib/enonic/market')
};

// Handle GET request
exports.get = handleGet;

function handleGet(req) {
    var component = libs.portal.getComponent();
    var view = resolve('featured-listings.html');
    var model = createModel();

    function createModel() {
        var model = {};

        model.heading = component.config.heading;
        model.viewAllPage = component.config.viewAllPage;
        model.listings = getFeaturedContent(component.config.featuredContent);

        return model;
    }

    function getFeaturedContent(content) {
        var contentArr = [];

        if (content) {
            content = libs.util.data.forceArray(content);

            for (var i = 0; i < content.length; i++) {
                var result = libs.util.content.get(content[i]);

                if (result) {

                    result.softwareIcon = libs.market.getSoftwareIconUrl(result);

                    contentArr.push(result);
                }
            }
        }

        return contentArr;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}