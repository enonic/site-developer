var libs = {
    portal: require('/lib/xp/portal'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    content: require('/lib/xp/content'),
    util: require('/lib/enonic/util'),
    market: require('/lib/enonic/market'),
    moment: require('/assets/js/vendor/moment.min.js'),
    mail: require('/lib/xp/mail'),
    httpClient: require('/lib/xp/http-client'),
    md5: require('/lib/md5.js'),
    markdown: require('/lib/markdown')
};

exports.get = handleGet;
exports.post = handlePost;

function handleGet(req) {

    var component = libs.portal.getComponent();
    var view = resolve('software-show.html');
    var model = createModel();

    function createModel() {
        var model = {};

        var software = libs.portal.getContent();

        //libs.util.log(software);

        model.liveMode = (req.mode === 'live');


        model.urlParams = req.params;
        model.postUrl = libs.portal.componentUrl({
            component: component.path
        });
        model.software = software;

        model.software.data.details = model.software.data.details ? libs.markdown.render(model.software.data.details) : null;

        model.softwareType = libs.market.getSoftwareType(software);
        model.vendor = libs.market.getVendor(software.data.vendor);
        model.iconUrl = libs.market.getSoftwareIconUrl(software);
        model.licenseType = libs.market.getLicenseType(model.software);
        model.software.data.screenshots = libs.util.data.forceArray(model.software.data.screenshots);
        model.software.data.screenshots = libs.util.data.trimArray(model.software.data.screenshots);
        model.hasScreenshots = model.software.data.screenshots.length ? true : false;
        model.sourceCodeLink = (model.softwareType == "starter") ? model.software.data.gitUrl : model.software.data.sourceCodeUrl;
        //model.initProjectRepo = libs.market.getInitProjectRepo(software);

        var sortedVersions = libs.market.getSortedVersions(software.data.version);

        if (sortedVersions.length) {
            model.versions = sortedVersions;
            model.newestVersion = sortedVersions[0];
            var selectedVersionNumber;

            if (req.params.v && versionExists(sortedVersions, req.params.v)) {
                selectedVersionNumber = req.params.v;
            }
            else {
                selectedVersionNumber = model.newestVersion.versionNumber;
            }

            model.selectedVersion = getVersion(sortedVersions, selectedVersionNumber);
            model.selectedVersion.versionDatePrettified = model.selectedVersion.versionDate ? libs.moment(model.selectedVersion.versionDate).format('MMM Do YYYY') : null;

            for (var i=0; i<sortedVersions.length; i++) {
                sortedVersions[i].versionDatePrettified = sortedVersions[i].versionDate ? libs.moment(sortedVersions[i].versionDate).format('MMM Do YYYY') : null;
            }

            model.jarUrl = libs.market.getJarUrl(software, model.selectedVersion.versionNumber, model.vendor);
            model.jarPlaceholderUrl = libs.market.getJarUrl(software, 'VERSIONPLACEHOLDER', model.vendor);

            model.installAppCommands = libs.market.getInstallAppCommands(model.jarUrl);
            model.installAppCommandsPlaceholder = libs.market.getInstallAppCommands(model.jarPlaceholderUrl);

            model.initProjectCommands = libs.market.getInitProjectCommands(software, model.selectedVersion);

        }

        return model;
    }


    /**
     *
     * @param {array} versions
     * @param {string} versionNumber
     * @returns {boolean}
     */
    function versionExists(versions, versionNumber) {
        return versions.filter(function(obj) {
            return obj.versionNumber == versionNumber;
        }).length ? true : false;
    }


    /**
     *
     * @param {array} versions
     * @param {string} versionNumber
     * @returns {object}
     */
    function getVersion(versions, versionNumber) {
        return versions.filter(function(obj) {
            return obj.versionNumber == versionNumber;
        })[0];
    }



    return {
        body: libs.thymeleaf.render(view, model)
    };
}


function handlePost(req) {
    var returnData = {
        success: false,
        message: null
    };
    var success = false;
    var p = req.params;
    var component = libs.portal.getComponent();
    var folderKey = component.config['saveFolder'] || null;
    var saveLocation = libs.util.content.getPath(folderKey);

    // Verify the g-recaptcha-response
    //var recaptchaVerified = recaptcha.verify(req.params['g-recaptcha-response']);
    var recaptchaVerified = true;

    // Check required fields and create content
    if (recaptchaVerified && p['cloud-trial-email']) {


        try {
            var sentMail = libs.mail.send({
                from: p['cloud-trial-email'],
                to: 'mer@enonic.com',
                subject: 'Free cloud trial request',
                body: '<h1>I want to try ' + p['software'] + '!</h1><p>' + p['cloud-trial-email'] + '</p>',
                contentType: 'text/html; charset="UTF-8"'
            });
            if (!sentMail) {
                throw 'Could not send email';
            }
        }
        catch (err) {
            log.info(err);
        }

        try {
            var sentMail = libs.mail.send({
                from: 'Morten at Enonic <mer@enonic.com>',
                to: p['cloud-trial-email'],
                subject: 'Thank you for signing up to the test-drive of ' + p['software'],
                body: 'Hi,<br/><br/>We have received your request. One of our minions will spawn your cloud trial within 24 hours.<br/><br/><img src="' + libs.portal.assetUrl({path: 'img/minion-dance.gif', type: 'absolute'}) + '"/><br/><br/>We will be in touch soon!<br/><br/>Best regards,<br/>Team Enonic',
                contentType: 'text/html; charset="UTF-8"'
            });
            if (!sentMail) {
                throw 'Could not send email';
            }
        }
        catch (err) {
            log.info(err);
        }

        var result = libs.content.create({
            parentPath: saveLocation,
            displayName: p['cloud-trial-email'],
            branch: 'draft',
            contentType: 'base:unstructured',
            data: {
                email: p['cloud-trial-email'],
                software: p['software']
            }
        });

        if (result._id) {
            success = true;
        }

        /*try {
            addUsertoMailchimpList(p['cloud-trial-email'], p['software']);
            success = true;
        }
        catch (err) {
            var result = libs.content.create({
                parentPath: saveLocation,
                displayName: p['cloud-trial-email'],
                branch: 'draft',
                contentType: 'base:unstructured',
                data: {
                    email: p['cloud-trial-email'],
                    software: p['software']
                }
            });

            if (result._id) {
                success = true;
            }
        }*/


        if (success) {
            returnData.success = true;
            returnData.message = '<h2>Request submitted</h2>Brilliant, our minions are working on setting up a free cloud trial of the "' + p['software'] + '" application.<br/>Please check your mail for more information.<br/><br/>';
        }
        else {
            returnData.message = 'Form could not be submitted. Please try again or give us a call.'
        }
    }

    function addUsertoMailchimpList(email, software) {
        var emailLC = email.toLowerCase();
        var emailMD5 = libs.md5(emailLC);
        var url = 'https://us9.api.mailchimp.com/3.0/lists/a8c3f33395/members/' + emailMD5;

        var response = libs.httpClient.request({
            url: url,
            method: 'PUT',
            headers: {
                'Authorization': 'Basic YWRkNGU0MWI4YTFhMDVlZmY3YzY3NjM1ZDZhMzk4NmEtdXM5OmFkZDRlNDFiOGExYTA1ZWZmN2M2NzYzNWQ2YTM5ODZhLXVzOQ=='
            },
            body: '{"email_address": "' + email + '", "status": "subscribed", "merge_fields": {"SOFTWARE": "' + software + '"}}',
            connectionTimeout: 5000,
            readTimeout: 5000,
            contentType: 'application/json'
        });

        //libs.util.log(response);

        if (response.status !== 200) {
            if (response.status === 400 && response.title === 'Member Exists') {
                throw 'Email already exists';
            }
            throw 'Could not retrieve JSON url (' + response.status + ')';
        }

        return true;
    }


    return {
        contentType: 'text/json',
        body: returnData
    }
}