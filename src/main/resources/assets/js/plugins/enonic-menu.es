(function ($) {
    function EnonicMenu(element) {

        var that = this;
        this.menu = element;
        this.lastFocus = null;

        this.init = function (options) {
            this.body = $('body');
            this.toggleBtn = options.toggleBtn;
            this.menuVisible = false;
            this.bindEvents();
        };

        // Bind modal events
        this.bindEvents = function() {
            this.bindToggleBtnClick();
            this.bindBackdropClick();
            this.bindEscClick();
        };

        // Show the menu
        this.showMenu = function () {
            this.body.addClass('main-nav-toggled');
            this.menu.attr('aria-expanded', 'true');
            this.toggleBtn.attr('aria-expanded', 'true');
            this.menuVisible = true;
        };

        // Hide the menu
        this.hideMenu = function () {
            this.body.removeClass('main-nav-toggled');
            this.menu.attr('aria-expanded', 'false');
            this.toggleBtn.attr('aria-expanded', 'false');
            this.menuVisible = false;
        };

        // Click on toggle button
        this.bindToggleBtnClick = function () {
            this.toggleBtn.on('click', $.proxy(function (e) {
                e.preventDefault();
                if (this.menuVisible) {
                    this.hideMenu();
                }
                else {
                    this.showMenu();
                }
            }, this));
        };

        // Click outside of menu
        this.bindBackdropClick = function () {
            $(document).on('click', $.proxy(function (e) {
                var clickIsOnMenuContent = $(e.target).closest(this.menu.find('a, form')).length;
                var clickIsOnToggleBtn = $(e.target).closest(this.toggleBtn).length;
                if (this.menuVisible && !clickIsOnMenuContent && !clickIsOnToggleBtn) {
                    this.hideMenu();
                }
            }, this));
        };

        // Click on ESC button
        this.bindEscClick = function () {
            $(document).on('keyup', $.proxy(function (e) {
                if (e.keyCode === 27) {
                    this.hideMenu();
                }
            }, this));
        };


    }

    $.fn.enonicMenu = function (options) {
        return this.each(function () {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('enonicmenu')) {
                return;
            }

            // pass options to plugin constructor
            var enonicMenu = new EnonicMenu(element);
            enonicMenu.init(options);

            // Store plugin object in this element's data
            element.data('enonicmenu', enonicMenu);
        });
    };
})(jQuery);