var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    content: require('/lib/xp/content'),
    util: require('/lib/enonic/util'),
    market: require('/lib/enonic/market'),
    moment: require('/assets/js/vendor/moment.min.js')
};

// Handle GET request
exports.get = handleGet;

function handleGet(req) {

    var software = libs.portal.getContent();
    var sortedVersions = libs.market.getSortedVersions(software.data.version);
    var newestVersion = sortedVersions[0].versionNumber;

    var shieldUrl = 'https://img.shields.io/badge/' + software.displayName + '-' + newestVersion + '-blue.svg';

    return {
        redirect: shieldUrl
    };
}