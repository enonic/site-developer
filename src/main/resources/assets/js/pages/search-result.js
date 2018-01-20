$('.page-search-result-header__filter-reset').click(function () {
    var currentUrl = window.location.href;
    var resultUrl = currentUrl.substr(0, currentUrl.indexOf('&doc='));
    window.location.href = resultUrl;
});