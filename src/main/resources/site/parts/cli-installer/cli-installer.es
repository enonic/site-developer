var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/thymeleaf'),
    httpClient: require('/lib/http-client'),
    util: require('/lib/util'),
    moment: require('/lib/moment'),
    content: require('/lib/xp/content'),
    common: require('/lib/xp/common'),
    //mail: require('/lib/xp/mail'),
    //stk: require('/lib/stk/stk.js'),
    md5: require('/lib/md5')
};

exports.get = handleGet;

function handleGet(req) {
    //log.info(JSON.stringify(req, null, 4));

    var view = resolve('cli-installer.html');
    var model = createModel(req);

    function createModel(req) {
        var model = {};

        model.errors = [];

        model.component = libs.portal.getComponent();

        model.tabs = [];
        var tabSources = libs.util.data.forceArray(model.component.config.tabs);
        tabSources.forEach(function(tabSource) {
            if (tabSource) {
                var tab = {}
                tab.title = tabSource.title || 'Title';
                tab.name = libs.common.sanitize(tab.title);
                tab.svgUrl = tabSource.svg ? libs.portal.attachmentUrl({
                    id: tabSource.svg
                }) : null;
                tab.text = tabSource.text ? libs.portal.processHtml({
                    value: tabSource.text
                }) : '';

                //
                if (req.headers['User-Agent'] && tabSource.operatingSystem) {
                    tab.isActive = RegExp(tabSource.operatingSystem).test(req.headers['User-Agent']);
                }

                model.tabs.push(tab);
            }
        });

        model.urlParams = req.params;
        model.postUrl = libs.portal.componentUrl({
            component: model.component.path
        });

        model.isEditMode = req.mode === 'edit'
        model.isEditOrPreview = req.mode === 'edit' || req.mode === 'preview';

        /*try {
            model.latestInstallerStableVersion = getLatestInstallerStableVersion();
            model.installerInfo = getAllInstallerInfo(model.latestInstallerStableVersion);
            model.latestDistroStableVersion = getLatestDistroStableVersion();
            model.distroInfo = getDistroInfo(model.latestDistroStableVersion);
            model.dockerInfo = getDockerInfo(model.latestDistroStableVersion);

            model.distroCommand = 'bash -c "$(curl -L http://repo.enonic.com/public/com/enonic/xp/install/enonic-xp/';
            model.distroCommand += model.latestDistroStableVersion;
            model.distroCommand += '/enonic-xp-';
            model.distroCommand += model.latestDistroStableVersion;
            model.distroCommand += '-script.sh)"';
        }
        catch(err) {
            model.errors.push(err);
        }*/

        model.errorExists = model.errors.length > 0;

        if (model.errorExists) {
            libs.util.log(model.errors);
        }

        // Show something in edit mode when part config is empty
        if (model.isEditOrPreview && !model.tabs.length) {
            model.tabs.push({
                title: '[Error: tab title missing]',
                name: 'title',
                svgUrl: null,
                text: '[No valid tab entry in part config]'
            })
        }

        return model;
    }

    function getJSON(url) {
        var response = libs.httpClient.request({
            url: url,
            method: 'GET',
            connectionTimeout: 5000,
            readTimeout: 5000,
            contentType: 'application/json'
        });

        if (response.status !== 200) {
            throw 'Could not retrieve JSON url (' + response.status + ')';
        }
        return JSON.parse(response.body);
    }

    function getLatestDistroStableVersion() {
        var jsonUrl = 'http://repo.enonic.com/services/latest/public/com.enonic.xp:distro';
        var json = getJSON(jsonUrl);
        if (json.stableVersion === undefined) {
            throw 'Stable version undefined';
        }
        return json.stableVersion;
    }

    function getLatestInstallerStableVersion() {
        var jsonUrl = 'http://repo.enonic.com/services/latest/public/com.enonic.xp.install:enonic-xp';
        var json = getJSON(jsonUrl);
        if (json.stableVersion === undefined) {
            throw 'Stable version undefined';
        }
        return json.stableVersion;
    }

    function getInstallerInfo(version, os) {
        var installerInfo = {};
        var jsonUrl = 'http://repo.enonic.com/services/info/public/com.enonic.xp.install:enonic-xp:';
        jsonUrl += version + ':';

        switch (os) {
            case 'windows':
                jsonUrl += 'win@exe';
                break;
            case 'macos':
                jsonUrl += 'mac@dmg';
                break;
        }

        installerInfo = getJSON(jsonUrl);

        if (installerInfo.path === undefined) {
            throw 'Installer info path undefined';
        }

        installerInfo.path = 'http://repo.enonic.com' + installerInfo.path;
        installerInfo.timestamp = libs.moment(installerInfo.timestamp).format('YYYY-MM-DD');
        installerInfo.size = bytesToSize(installerInfo.size);

        return installerInfo;
    }

    function getDistroInfo(version) {
        var distroInfo = {};
        var jsonUrl = 'http://repo.enonic.com/services/info/public/com.enonic.xp:distro:';
        jsonUrl += version + '@zip';

        distroInfo = getJSON(jsonUrl);

        if (distroInfo.path === undefined) {
            throw 'Distro info path undefined';
        }

        distroInfo.path = 'http://repo.enonic.com' + distroInfo.path;
        distroInfo.timestamp = libs.moment(distroInfo.timestamp).format('YYYY-MM-DD');
        distroInfo.size = bytesToSize(distroInfo.size);

        return distroInfo;
    }

    function getDockerInfo(version) {
        var dockerInfo = {};
        var jsonUrl = 'http://repo.enonic.com/services/info/public/com.enonic.xp:distro:';
        jsonUrl += version + '@zip';

        var distroInfo = getJSON(jsonUrl);

        dockerInfo.path = 'https://hub.docker.com/r/enonic/xp-app/';
        dockerInfo.timestamp = libs.moment(distroInfo.timestamp).format('YYYY-MM-DD');
        //dockerInfo.size = bytesToSize(distroInfo.size);

        return dockerInfo;
    }

    function getAllInstallerInfo(version) {
        return {
            macos: getInstallerInfo(version, 'macos'),
            windows: getInstallerInfo(version, 'windows')
        }
    }

    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    //log.info(JSON.stringify(model, null, 4));

    return {
        body: libs.thymeleaf.render(view, model)
    };
}
