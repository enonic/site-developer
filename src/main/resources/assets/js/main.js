'use strict';

// Global
require('./plugins/live-search.js');
$('.live-search__input').liveSearch();

require('./plugins/pagination.js');
$('.pagination').pagination();

require('./plugins/enonic-menu.js');
$('.page-default__main-menu').enonicMenu({
    toggleBtn: $('.page-default__main-menu-trigger')
});

require('./plugins/responsive.js');
$('.docpage-content').responsive([[0, 1024], [1024, Infinity]]);

require('./vendor/prism.js');

var svg4everybody = require('./vendor/svg4everybody.js');
svg4everybody();

require('./vendor/jquery.validate.min.js');
require('./vendor/jquery.form.min.js');

// Pages
require('./pages/default.js');

/*$(function () {
 $('.page-header-search__icon').on('click', function () {
 $('.page-header-search__input').focus();
 });
 });
 */