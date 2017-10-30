var libs = {
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content'),
    util: require('/lib/enonic/util'),
    market: require('/lib/enonic/market')
};

exports.responseFilter = function (req, res) {

    if (req.headers.Accept === 'application/json') {

        var returnBody = {
            hits: []
        };

        var xpVersion = req.params.xpVersion;
        var start = req.params.start ? req.params.start : 0;
        var count = req.params.count ? req.params.count : 10;
        var names = req.body.ids;
        var ids;

        if (req.body) {

            req.body = JSON.parse(req.body);

            //log.info('req.body.ids exist');
            try {
                ids = req.body.ids
            } catch (e) {
                log.warning('Invalid parameter ids: %s, using []', req.params.ids);
                ids = [];
            }
        }

        if (xpVersion) {

            var compatibleApps = libs.market.getCompatibleApps({
                xpVersion: xpVersion,
                versionFieldName: "data.version.supportedVersions",
                names: names,
                from: start,
                size: count,
                contentTypeName: app.name + ':application',
                ids: ids
            });

            returnBody = createApplicationsModel(compatibleApps, xpVersion, ids);
        }

        res.contentType = 'application/json';
        res.body = returnBody
    }

    return res;
};

function createApplicationsModel(result, xpVersion, ids) {
    var applications = {
        total: 0,
        hits: {}
    };

    applications.total = result.total;

    for (var i = 0; i < result.hits.length; i++) {

        var application = getAppData(result.hits[i], xpVersion);
        applications.hits[application.name] = application;
    }

    return applications;
}
/**
 *
 * @param {string} xpVersion
 * @param {number} start
 * @param {number} count
 * @returns {}
 */
function getApps(xpVersion, start, count, ids) {
    //var xpVersionMajor = xpVersion.split('.')[0] + '.0.0';

    //var query = "range('data.version.supportedVersions', '" + xpVersionMajor + "', '" + xpVersion + "', 'true', 'true')";

    /*if (ids && ids.length >= 0) {
     // 0 length may occur when ids param is incorrect
     var idString = ids.map(function (id) {
     return "\"" + id + "\""
     }).join(',');
     query += ' AND _name IN (' + idString + ')';
     }

     var result = libs.content.query({
     query: query,
     count: count,
     start: start,
     contentTypes: [
     app.name + ':application'
     ],
     sort: 'displayName'
     });*/

    var compatibleApps = libs.market.getCompatibleApps({
        xpVersion: xpVersion,
        versionFieldName: "data.version.supportedVersions",
        names: names,
        from: req.params.start,
        size: req.params.count,
        ids: ids
    });

    //libs.util.log(result);

    return createApplicationsModel(compatibleApps, xpVersion);
}

/**
 * Get app data
 * @param {Object} app
 * @param {string} xpVersion
 * @returns {{}}
 */
function getAppData(app, xpVersion) {
    var appData = {};

    appData.displayName = app.displayName;
    appData.name = app.data.groupId + '.' + app.data.artifactId;
    appData.description = app.data.shortDescription;
    appData.iconUrl = getAbsoluteUrl(libs.market.getSoftwareIconUrl(app));
    appData.url = getAbsoluteUrl(libs.portal.pageUrl({
        id: app._id
    }));


    var supportedAppVersions = getSupportedAppVersions(app.data.version, xpVersion);
    var sortedSupportedAppVersions = libs.market.getSortedVersions(supportedAppVersions);

    //log.info('UTIL log %s', JSON.stringify(sortedSupportedAppVersions, null, 4));

    if (sortedSupportedAppVersions.length) {
        appData.latestVersion = sortedSupportedAppVersions[0].versionNumber;

        //log.info('UTIL log %s', JSON.stringify(sortedSupportedAppVersions, null, 4));
    }

    appData.versions = {};

    for (var i = 0; i < sortedSupportedAppVersions.length; i++) {
        var version = sortedSupportedAppVersions[i];
        appData.versions[version.versionNumber] = {
            applicationUrl: libs.market.getJarUrl(app, version.versionNumber)
        }
    }


    //hit.minVersion = '';
    //hit.vendor = (libs.market.getVendor(app.data.vendor) || {}).displayName;

    return appData;
}

function getAbsoluteUrl(url) {
    var absoluteUrl = 'https://market.enonic.com';

    //var portalMatch = /^(\/portal\/master\/)(enonic\-market\/)?/;
    //absoluteUrl += url.replace(portalMatch, '');
    absoluteUrl += url;

    return absoluteUrl;
}

/**
 * Get download (JAR) url for the newest compatible version of an app
 * @param {Object} app
 * @param {string} xpVersion
 * @returns {string}
 */
/*function getDownloadUrl(app, xpVersion) {
 var url = '';
 var supportedAppVersions = getSupportedAppVersions(app.data.version, xpVersion);
 var sortedVersions = libs.market.getSortedVersions(supportedAppVersions);

 if (sortedVersions.length) {
 var selectedVersionNumber = sortedVersions[0].versionNumber;
 url = libs.market.getJarUrl(app, selectedVersionNumber);
 }

 return url;
 }*/

/**
 * Gets an array of app versions that are compatible with xpVersion
 * @param {Array} versions
 * @param {String} xpVersion
 * @returns {Array}
 */
function getSupportedAppVersions(versions, xpVersion) {
    var supportedAppVersions = [];
    versions = libs.util.data.forceArray(versions);

    for (var i = 0; i < versions.length; i++) {
        var version = versions[i];
        var supported = false;
        version.supportedVersions = libs.util.data.forceArray(version.supportedVersions);

        for (var j = 0; j < version.supportedVersions.length; j++) {

            var supportedXPVersion = version.supportedVersions[j];

            if (libs.market.isValidVersion(supportedXPVersion)) {
                supported = libs.market.isSupportedVersion(xpVersion, supportedXPVersion);
            }

        }

        if (supported) {
            supportedAppVersions.push(version);
        }
    }

    return supportedAppVersions;
}
