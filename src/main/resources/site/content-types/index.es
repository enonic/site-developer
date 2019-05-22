export const APP_NAME       = app.name;
export const CT_DOC         = `${APP_NAME}:doc`;
export const CT_DOCPAGE     = `${APP_NAME}:docpage`;
export const CT_DOCVERSION  = `${APP_NAME}:docversion`;
export const CT_GUIDE       = `${APP_NAME}:guide`;
export const CT_LANDINGPAGE = `${APP_NAME}:landing-page`;
export const CT_ARTICLE     = `${APP_NAME}:article`;

export const RT_HTML = 'text/html; charset=UTF-8';
export const RT_JSON = 'text/json';


export function isDoc(content) {
    return content.type === CT_DOC;
}


export function isDocPage(content) {
    return content.type === CT_DOCPAGE;
}


export function isDocVersion(content) {
    return content.type === CT_DOCVERSION;
}


export function isGuide(content) {
    return content.type === CT_GUIDE;
}


export function isLandingPage(content) {
    return content.type === CT_LANDINGPAGE;
}
