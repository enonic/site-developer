var portal = require('/lib/xp/portal');

exports.getSocialLinks = function getSocialLinks() {
    return [
        {
            name: 'twitter',
            url: 'https://twitter.com/EnonicHQ'
        },
        {
            name: 'facebook',
            url: 'https://www.facebook.com/enonic.no'
        },
        {
            name: 'linkedin',
            url: 'https://www.linkedin.com/company/enonic'
        },
        {
            name: 'gplus',
            url: 'https://plus.google.com/+EnonicCommunity/'
        },
        {
            name: 'youtube',
            url: 'https://www.youtube.com/user/EnonicCommunity'
        },
        {
            name: 'webagility',
            url: 'http://webagility.com'
        }
    ];
};

exports.getSiteUrl = function() {
    var sitePath = portal.getSite()._path;
    var baseUrl = portal.pageUrl({
        path: sitePath
    });
    
    if (baseUrl.slice(-1) != '/') {
        return baseUrl + '/';
    }
    
    return baseUrl;
};

exports.getSiteDisplayName = function () {
    return portal.getSite().displayName;
};

exports.getSitePath = function () {
    return portal.getSite()._path;
};