// Includes.
var contextLib = require('/lib/xp/context');
var contentLib = require('/lib/xp/content');

var branch = 'draft';
var sitePath = '/developersite';

function sudo(callback) {
    return contextLib.run({
        principals: ['role:system.admin'],
        user: {
            login: 'su'
        }
    }, callback);
}

function createContent(params) {
    return sudo(contentLib.create.bind(null, params));
}

function getContent(params) {
    return sudo(contentLib.get.bind(null, params));
}

function modifyContent(params) {
    return sudo(contentLib.modify.bind(null, params));
}

function deleteContent(params) {
    return sudo(contentLib.delete.bind(null, params));
}

function queryContent(params) {
    return sudo(contentLib.query.bind(null, params));
}

// Find all entry keys.
exports.findAllEntries = function () {
    var expr = "type ='" + app.name + ":guide' AND _parentPath LIKE '/content/" + sitePath + "/*'";

    var result = queryContent({
        query: expr,
        start: 0,
        count: 10000
    });

    var keys = [];
    for (var i = 0; i < result.hits.length; i++) {
        var node = getContent({
            key: result.hits[i]._id
        });
        if (node) {
            keys.push(node._name);
        }
    }

    return keys;
};

// Update data.
function updateData(entry, c) {
    c.displayName = entry.title
    c.data.vendor = entry.vendor
    c.data.tags = entry.tags;
    c.data.baseUrl = entry.baseUrl;
    c.data.html = entry.doc.html;
    c.data.raw = entry.doc.text
}

// Update entry.
exports.updateEntry = function (entry) {
    var content = getContent({
        key: sitePath + '/guides/' + entry.name,
        branch: branch
    });

    if (content) {
        modifyContent({
            key: content._path,
            branch: branch,
            requireValid: false,
            editor: function (old) {
                updateData(entry, old);
                return old;
            }
        });
    } else {
        var guidesFolder = getContent({
            key: sitePath + '/guides',
            branch: branch
        });

        if (!guidesFolder) {
            guidesFolder = createContent({
                name: 'guides',
                parentPath: sitePath,
                displayName: 'Guides',
                contentType: 'base:folder',
                branch: branch,
                data: {}
            });
        }

        var props = {
            name: entry.name,
            parentPath: guidesFolder._path,
            contentType: app.name + ':guide',
            branch: branch,
            requireValid: false,
            data: {
                category: guidesFolder._id
            }
        };

        updateData(entry, props);

        createContent(props);
    }
};

// Delete entry.
exports.deleteEntry = function (key) {
    deleteContent('/' + key);
};

function capitalizeFirstLetter(value) {
    if (!value) {
        return '';
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}