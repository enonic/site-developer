(function ($) {
    function Modal(element) {

        var that = this;
        this.body = $('body');
        this.modal = element;
        this.lastFocus = null;

        this.init = function (options) {
            this.triggerEl = options.trigger;

            // Modal is triggered if true
            this.triggered = options.triggered === true;

            // Modal is removed from DOM if true
            this.removeOnClose = options.removeOnClose === true;

            this.createModal();
            if (this.triggered) {
                this.showModal();
            }
            this.bindEvents();
        };

        // Bind modal events
        this.bindEvents = function() {
            this.bindTriggerClick();
            this.bindBackdropClick();
            this.bindCloseClick();
            this.bindElementFocus();
            //this.bindObserve();
        };

        /*this.bindObserve = function() {
            // create an observer instance
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    console.log(mutation.type);
                    that.setModalHeight();
                });
            });

// configuration of the observer:
            var config = { attributes: true, subtree: true };


// pass in the target node, as well as the observer options
            this.modal.each(function() {
                observer.observe(this, config);
            });

        };

        this.setModalHeight = function() {
            //console.log(this.modalContent.height());
            var modalContainerHeight = this.modalContainer.height();
            var totalHeight = 0;
            this.modalContent.children().each(function() {

                var childHeight = $(this).height();
                //console.log(childHeight);
                //$(this).height(childHeight);
                totalHeight += childHeight;
            });

            if (totalHeight > modalContainerHeight) {
                var modalHeader = this.modalContent.find('.modal__header');
                var modalBody = this.modalContent.find('.modal__body');

                modalBody.height(modalContainerHeight - modalHeader.height());

            }
            this.modalContent.height(totalHeight);
        };*/

        this.createModal = function() {
            this.modal.addClass('modal');
            //this.modalContent = this.modal.wrapInner('<div class="modal__content"/>').children();
            //this.modalContainer = this.modal.wrapInner('<div class="modal__container"/>').children();



            this.modal.wrapInner('<div class="modal__content"/>');
            this.modalContent = this.modal.children().get(0);

            this.modal.wrapInner('<div class="modal__container"/>');
            this.modalContainer = this.modal.children().get(0);


            this.closeBtn = $('<button class="modal__btn"><span class="modal__btn-text">Close</span></button>');
            this.closeBtn.prependTo(this.modalContainer);
            // Make modal content focusable
            this.modalContainer.tabIndex = 0;
            //this.modalContent.attr('tabindex', 0);
        };

        // Click on login link
        this.bindTriggerClick = function() {
            if (this.triggerEl) {
                this.triggerEl.on('click', $.proxy(function(e) {
                    e.preventDefault();
                    this.showModal();
                }, this));
            }
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
                if (this.modal.hasClass('modal--active') && !$(e.target).closest(this.modalContainer).length && !$(e.target).closest(this.triggerEl).length) {
                    this.hideModal();
                }
            }, this));
        };

        // Keep elements outside modal unfocusable when active
        this.bindElementFocus = function() {
            document.addEventListener('focus', function(e) {
                if (this.modal.hasClass('modal--active') && this.modalContainer !== e.target && !$.contains(this.modalContainer, e.target)) {
                    e.stopPropagation();
                    this.modalContainer.focus();
                }
            }.bind(this), true);
        };

        // Show modal window
        // Save current focus element
        this.showModal = function() {
            this.lastFocus = document.activeElement;
            this.modal.addClass('modal--active');
            this.modal.css('visibility', 'visible');
            this.modalContainer.focus();
            this.body.css('overflow', 'hidden');
            //this.setModalBodyHeight();
        };

        // Hide modal window
        // Set focus to previous focus element
        this.hideModal = function() {
            this.modal.removeClass('modal--active');
            this.modal.css('visibility', 'hidden');
            this.body.css('overflow', 'auto');

            if (this.lastFocus) {
                this.lastFocus.focus();
            }

            if (this.removeOnClose) {
                this.modal.remove();
            }
        };

        /*this.setModalBodyHeight = function() {
            var modalBody = $(this.modalContent).find('.modal__body');
            var modalHeader = $(this.modalContent).find('.modal__header');
            var modalContentHeight = $(this.modalContent).height();
            if (modalBody && modalHeader) {
                modalBody.height(modalContentHeight - modalHeader.height());
            }
        };*/

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