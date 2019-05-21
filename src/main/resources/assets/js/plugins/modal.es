(function ($) {
    function Modal(element) {

        var that = this;
        this.body = $('body');
        this.modal = element;
        //this.modalContent;
        this.lastFocus = null;

        this.init = function (options) {
            this.triggerEl = options.trigger;
            this.createModal();
            this.bindEvents();
        };

        // Bind modal events
        this.bindEvents = function() {
            this.bindTriggerClick();
            this.bindBackdropClick();
            this.bindCloseClick();
            this.bindElementFocus();
        };


        this.createModal = function() {
            this.modal.addClass('modal');
            this.closeBtn = $('<button class="modal__btn"><span class="modal__btn-text">Close</span></button>');
            this.closeBtn.prependTo(this.modal);
            this.modal.wrapInner('<div class="modal__content"/>');
            this.modalContent = this.modal.children().get(0);
            // Make modal content focusable
            this.modalContent.tabIndex = 0;
        };

        // Click on login link
        this.bindTriggerClick = function() {
            this.triggerEl.on('click', $.proxy(function(e) {
                e.preventDefault();
                this.showModal();
            }, this));
        };

        // Click on modal close button
        this.bindCloseClick = function() {
            this.closeBtn.on('click', $.proxy(function(e) {
                this.hideModal();
            }, this));
        };

        // Click outside of modal window
        this.bindBackdropClick = function() {
            $(document).on('click', $.proxy(function(e) {
                if (this.modal.hasClass('modal--active') && !$(e.target).closest(this.modalContent).length && !$(e.target).closest(this.triggerEl).length) {
                    this.hideModal();
                }
            }, this));
        };

        // Keep elements outside modal unfocusable when active
        this.bindElementFocus = function() {
            document.addEventListener('focus', function(e) {
                if (this.modal.hasClass('modal--active') && this.modalContent !== e.target && !$.contains(this.modalContent, e.target)) {
                    e.stopPropagation();
                    this.modalContent.focus();
                }
            }.bind(this), true);
        };

        // Show modal window
        // Save current focus element
        this.showModal = function() {
            this.lastFocus = document.activeElement;
            this.modal.addClass('modal--active');
            //this.modal.show();
            this.modal.css('visibility', 'visible');
            this.modalContent.focus();
        };

        // Hide modal window
        // Set focus to previous focus element
        this.hideModal = function() {
            this.modal.removeClass('modal--active');
            //this.modal.hide();
            this.modal.css('visibility', 'hidden');

            if (this.lastFocus) {

                this.lastFocus.focus();
            }
        };

    }

    $.fn.modal = function (options) {
        return this.each(function () {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('modal')) {
                return;
            }

            // pass options to plugin constructor
            var modal = new Modal(element);
            modal.init(options);

            // Store plugin object in this element's data
            element.data('modal', modal);
        });
    };
})(jQuery);
