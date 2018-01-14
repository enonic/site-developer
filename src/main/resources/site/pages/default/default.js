//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
var libs = {
    portal :    require('/lib/xp/portal'),
    thymeleaf : require('/lib/xp/thymeleaf'),
    menu:       require('/lib/enonic/menu'),
    util:       require('/lib/util')
};

// Imported functions
var getCurrentContent = libs.portal.getContent;
var getCurrentSite    = libs.portal.getSite;
var getMenuTree       = libs.menu.getMenuTree;
var getSiteUrl        = libs.util.getSiteUrl;
var render            = libs.thymeleaf.render;
var serviceUrl        = libs.portal.serviceUrl;

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
var VIEW = resolve('default.html'); // The view to render

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
exports.get = function(req) {

    function getBodyClass(headerType) {
        return !!headerType && (
          headerType == 'hidden' ? 'no-header' :
          headerType == 'layered' ? 'layered' : ''
        ) || '';
    }

    var content = getCurrentContent();
    var headerType = content.page.config['headerType'];
    var model =  {
      mainRegion: content.page.regions['main'],
      sitePath: getCurrentSite()['_path'],
      currentPath: content._path,
      pageTitle: content['displayName'],
      menuItems: getMenuTree(3),
      searchResultPageUrl: getSiteUrl() + 'search',
      serviceUrl: serviceUrl({ service: 'search' }),

      headerClass: headerType ? 'header-' + headerType : 'header-default', // Defines whether page header is layered or not
      headerColor: content.page.config['headerColor'], // Header logo and menu button color
      bodyClass: getBodyClass(headerType),
      pageColor: content.page.config['pageColor'],

      showHeaderSearch: true
    }; // model

    return { body: render(VIEW, model) };
} // exports.get
exports.post = exports.get;
