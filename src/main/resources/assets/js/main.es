'use strict';

// Global
require('./plugins/live-search.es');
$('.live-search__input').liveSearch();

require('./plugins/pagination.es');
$('.pagination').pagination();

require('./plugins/enonic-menu.es');
$('.main-menu').enonicMenu({
    toggleBtn: $('.main-menu-trigger')
});

require('./plugins/responsive.es');
$('.docpage').responsive([[0, 768], [768, 1024], [1024, 1280], [1280, 1440], [1440, Infinity]]);

require('./vendor/prism.js');

var svg4everybody = require('./vendor/svg4everybody.js');
svg4everybody();

require('./vendor/jquery.validate.min.js');
require('./vendor/jquery.form.min.js');

// Pages
require('./pages/default.es');
require('./pages/search-result.es');

// Parts
require('./parts/docpage.es');

/*$(function () {
 $('.page-header-search__icon').on('click', function () {
 $('.page-header-search__input').focus();
 });
 });
 */
