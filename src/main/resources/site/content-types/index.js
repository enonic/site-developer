exports.APP_NAME      = app.name;
exports.CT_DOC        = app.name + ':doc';
exports.CT_DOCPAGE    = app.name + ':docpage';
exports.CT_DOCVERSION = app.name + ':docversion';
exports.CT_GUIDE      = app.name + ':guide';

exports.RT_HTML = 'text/html; charset=UTF-8';
exports.RT_JSON = 'text/json';


exports.isDoc = function(content) {
  return content.type === exports.CT_DOC;
}


exports.isDocpage = function(content) {
    return content.type === exports.CT_DOCPAGE;
}


exports.isDocVersion = function(content) {
    return content.type === exports.CT_DOCVERSION;
}


exports.isGuide = function(content) {
    return content.type === exports.CT_GUIDE;
}
