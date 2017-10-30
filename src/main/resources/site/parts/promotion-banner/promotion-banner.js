var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    util: require('/lib/enonic/util')
};

// Handle GET request
exports.get = handleGet;

function handleGet(req) {
    var component = libs.portal.getComponent();
    var view = resolve('promotion-banner.html');
    var model = createModel();

    function createModel() {
        var model = {};

        model.heading = component.config.heading;
        model.banners = getBanners();

        //log.info('UTIL log %s', JSON.stringify(component, null, 4));
        //log.info('UTIL log %s', JSON.stringify(model, null, 4));

        return model;
    }

    function getBanners() {
        var bannerArr = [];

        var banners = component.config.banner;

        if (banners) {
            bannerArr = libs.util.data.forceArray(banners);


        }

        return bannerArr;
    }

    return {
        body: libs.thymeleaf.render(view, model)
    };
}