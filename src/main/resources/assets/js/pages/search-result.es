$('.page-search-result-header__filter-reset').click(() => {
    const currentUrl = window.location.href;
    const resultUrl = currentUrl.substr(0, currentUrl.indexOf('&doc='));
    window.location.href = resultUrl;
});
