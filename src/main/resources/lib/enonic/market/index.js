var bean = __.newBean('com.enonic.app.market.MarketBean');

var libs = {
    portal: require('/lib/xp/portal'),
    content: require('/lib/xp/content'),
    util: require('/lib/enonic/util')
};

/**
 *
 * @param {array} versions
 * @returns {array}
 */
exports.getSortedVersions = function (versions) {
    // Sort the versions (newest first)
    versions = libs.util.data.forceArray(versions);
    versions = libs.util.data.trimArray(versions);
    versions.sort(exports.versionCompare).reverse();

    return versions;
};

/**
 *
 * @param {string} v1
 * @param {string} v2
 * @param options
 * @returns {integer}
 */
exports.versionCompare = function (v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.versionNumber.split('.'),
        v2parts = v2.versionNumber.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) {
            v1parts.push("0");
        }
        while (v2parts.length < v1parts.length) {
            v2parts.push("0");
        }
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {

        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
};

exports.getJarUrl = function (software, version) {
    var urlArray = [];
    var vendor = exports.getVendor(software.data.vendor),
        repo = '',
        groupId = '',
        artifactId = '',
        filename = '';

    if (software.data.repository) {
        repo = software.data.repository;
    }
    else {
        repo = ((vendor || {}).data || {}).repoUrl;
    }

    if (software.data.groupId) {
        groupId = software.data.groupId;
    }

    if (software.data.artifactId) {
        artifactId = software.data.artifactId;
    }

    if (repo && groupId && artifactId && version) {
        // remove trailing slash
        repo = repo.replace(/\/+$/, "");
        filename = artifactId + '-' + version + '.jar';
        urlArray.push(repo);
        urlArray.push.apply(urlArray, groupId.split('.'));
        urlArray.push(artifactId, version, filename);
    }

    //log.info('UTIL log %s', JSON.stringify(urlArray, null, 4));
    return urlArray.join('/');
};

/**
 * Get vendor
 * @param id
 * @returns {{}}
 */
exports.getVendor = function (id) {
    var vendor = {};

    if (id) {
        vendor = libs.content.get({
            key: id
        });
    }

    return vendor;
};

/**
 * Get software type (content type without app name)
 * @param {object} software
 * @returns {*}
 */
exports.getSoftwareType = function (software) {
    return software.type.split(':')[1];
};

/**
 * Get software icon url
 * If no icon is set for software, a default icon for software type is returned
 * @param {object} software
 * @returns {string}
 */
exports.getSoftwareIconUrl = function (software) {
    var url = '';
    var softwareType = software.type.split(':')[1];

    if (software.data.icon) {
        url = libs.portal.attachmentUrl({
            path: software._path,
            name: software.data.icon
        });
    }
    else {
        url = libs.portal.assetUrl({
            path: 'img/software-type-' + softwareType + '.svg'
        });
    }

    return url;
};

/**
 * Get software
 * @param contentTypes
 * @param xpVersion
 * @param count
 * @param start
 * @returns {*}
 */
exports.getSoftware = function (contentTypes, xpVersion, count, start) {
    var query = null;

    if (xpVersion) {
        var xpVersionMajor = xpVersion.split('.')[0] + '.0.0';
        query = "data.version.supportedVersions >= '" + xpVersionMajor + "' AND data.version.supportedVersions <= '" + xpVersion + "'";
    }

    var software = libs.content.query({
        query: query,
        count: count,
        start: start,
        contentTypes: contentTypes,
        sort: 'displayName'
    });

    for (var i = 0; i < software.hits.length; i++) {
        software.hits[i].softwareIcon = exports.getSoftwareIconUrl(software.hits[i]);

    }

    return software;
};

/**
 * Get software types (content types) with or without app name prefix
 * @param {boolean} qualifiedName
 * @returns {string[]}
 */
exports.getSoftwareTypes = function (qualifiedName) {
    var softwareTypes = ['application', 'library', 'starter'];

    if (qualifiedName) {
        softwareTypes = softwareTypes.map(function (el) {
            return app.name + ':' + el;
        })
    }

    return softwareTypes;
};


/**
 * Checks if version is in valid version format (1.0.0)
 * @param version
 * @returns {boolean}
 */
exports.isValidVersion = function (version) {
    return /^[0-9]+\.[0-9]+\.[0-9]+$/.test(version);
};

/**
 *
 * @param xpVersion
 * @param supportedXPVersion
 * @returns {boolean}
 */
exports.isSupportedVersion = function (xpVersion, supportedXPVersion) {

    var supportedXPVersionMajor = parseInt(supportedXPVersion.split('.')[0]);
    var supportedXPVersionMinor = parseInt(supportedXPVersion.split('.')[1]);
    var supportedXPVersionPatch = parseInt(supportedXPVersion.split('.')[2]);

    var xpVersionMajor = parseInt(xpVersion.split('.')[0]);
    var xpVersionMinor = parseInt(xpVersion.split('.')[1]);
    var xpVersionPatch = parseInt(xpVersion.split('.')[2]);

    // Main version must match
    if (supportedXPVersionMajor != xpVersionMajor) {
        return false;
    }

    // Minor is higher, this is supported
    if (supportedXPVersionMinor < xpVersionMinor) {
        return true;
    }

    // Minor lower, not supported
    if (supportedXPVersionMinor > xpVersionMinor) {
        return false;
    }

    // same major && minor version, ensure path version is equal or greater
    return supportedXPVersionPatch <= xpVersionPatch;
};

/**
 * Gets the license type for a software item
 * @param {object} software
 * @returns {{}}
 */
exports.getLicenseType = function (software) {
    var licenseType = {};

    var licenseTypes = [
        {
            name: 'MIT',
            url: 'http://choosealicense.com/licenses/mit/'
        },
        {
            name: 'Apache-2.0',
            url: 'http://choosealicense.com/licenses/apache-2.0/'
        },
        {
            name: 'GPL-2.0',
            url: 'http://choosealicense.com/licenses/gpl-2.0/'
        },
        {
            name: 'GPL-3.0',
            url: 'http://choosealicense.com/licenses/gpl-3.0/'
        },
        {
            name: 'EPL-1.0',
            url: 'http://choosealicense.com/licenses/epl-1.0/'
        },
        {
            name: 'LGPL-3.0',
            url: 'http://choosealicense.com/licenses/lgpl-3.0/'
        },
        {
            name: 'MPL-2.0',
            url: 'http://choosealicense.com/licenses/mpl-2.0/'
        },
        {
            name: 'AGPL-3.0',
            url: 'http://choosealicense.com/licenses/agpl-3.0/'
        },
        {
            name: 'BSD-2',
            url: 'http://choosealicense.com/licenses/bsd-2-clause/'
        },
        {
            name: 'BSD-3',
            url: 'http://choosealicense.com/licenses/bsd-3-clause/'
        }
    ];

    if (software.data.licenseType && software.data.licenseType !== 'other') {
        licenseType = licenseTypes.filter(function (obj) {
            return obj.name == software.data.licenseType;
        })[0];
    }
    else if (software.data.licenseName) {
        licenseType.name = software.data.licenseName;
        if (software.data.licenseUrl) {
            licenseType.url = software.data.licenseUrl;
        }
    }

    return licenseType;
};

/**
 * Get the shortest possible version of a init project repo url
 * Removes https://github.com and enonic since these are default values if not set in init-project
 * @param software
 * @returns {*}
 */
exports.getInitProjectRepo = function (software) {
    var repo = software.data.gitUrl;
    if (repo) {
        var search = /^(https?):\/\/(github.com\/)(enonic\/)?/;
        repo = repo.replace(search, '');
    }
    return repo;
};

/**
 * Get the starter init project commands for a version
 * @param software
 * @param version
 * @returns {{bash: string, batch: string}}
 */
exports.getInitProjectCommands = function (software, version) {
    var commonCommand = 'init-project -n <com.company.myapp> -d </my/projects> -r ' + exports.getInitProjectRepo(software);
    commonCommand += ' -c ' + version.gitTag;

    return {
        bash: '$ <$XP_INSTALL>/toolbox/toolbox.sh ' + commonCommand,
        batch: '$ <$XP_INSTALL>/toolbox/toolbox.bat ' + commonCommand
    };
};


exports.getInstallAppCommands = function (jarUrl) {
    var commonCommand = 'install-app -a <username>:<password> -u ' + jarUrl;
    //var commonCommand = 'init-project -n <com.company.myapp> -d </my/projects> -r ' + exports.getInitProjectRepo(software);

    return {
        bash: '$ <$XP_INSTALL>/toolbox/toolbox.sh ' + commonCommand,
        batch: '$ <$XP_INSTALL>/toolbox/toolbox.bat ' + commonCommand
    };
};


exports.getCompatibleApps = function (params) {

    var handlerParams = __.newBean('com.enonic.app.market.ListApplicationsParams');
    handlerParams.xpVersion = params.xpVersion;
    handlerParams.versionFieldName = params.versionFieldName;
    handlerParams.size = params.size ? params.size : 10;
    handlerParams.from = params.from ? params.from : 0;
    handlerParams.names = params.names ? params.names : [];
    handlerParams.contentTypeName = params.contentTypeName ? params.contentTypeName : null;
    handlerParams.orderBy = params.orderBy ? params.orderBy : "displayName ASC";
    handlerParams.ids = params.ids ? params.ids : [];

    var result = bean.listApplications(handlerParams);
    return __.toNativeObject(result);
};
