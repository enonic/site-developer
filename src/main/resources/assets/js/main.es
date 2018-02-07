//'use strict';

// Global
import './plugins/live-search.es';
import './plugins/pagination.es';
import './plugins/enonic-menu.es';
import './plugins/responsive.es';
import './vendor/prism.js';

import svg4everybody from './vendor/svg4everybody.js';

import './vendor/jquery.validate.min.js';
import './vendor/jquery.form.min.js';

// Pages
import './pages/default.es';
import './pages/search-result.es';

// Parts
import './parts/docpage.es';


$('.live-search__input').liveSearch();
$('.pagination').pagination();
$('.main-menu').enonicMenu({
    toggleBtn: $('.main-menu-trigger')
});
$('.docpage').responsive([[0, 768], [768, 1024], [1024, 1280], [1280, 1440], [1440, Infinity]]);
svg4everybody();

/*$(function () {
 $('.page-header-search__icon').on('click', function () {
 $('.page-header-search__input').focus();
 });
 });
 */
