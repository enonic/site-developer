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

require('./vendor/prism.js');

var svg4everybody = require('./vendor/svg4everybody.js');
svg4everybody();

require('./vendor/jquery.validate.min.js');
require('./vendor/jquery.form.min.js');

$(function () {
    jQuery.extend(jQuery.validator.messages, {
        required: "Required field.",
        email: "Invalid email."
    });

    $('form.validate').each(function() {
        $(this).validate({
            submitHandler: function (form, event) {
                $(form).addClass('form-submitted');
                $(form).find('button[type="submit"]').attr("disabled", true);

                var options = {
                    dataType: 'json',
                    success: function (resp, status, xhr) {
                        if (resp.success) {
                            $(form).addClass('success');
                            $(form).trigger('success');
                            window.dataLayer = window.dataLayer || [];
                            window.dataLayer.push({'event': 'formSubmitted_' + $(form).attr('id')}); // Google Tag Manager
                        }
                        else {
                            $(form).addClass('failed');
                        }
                        if (resp.message) {
                            //console.log($(form).data('form-success-container'));
                            if ($(form).data('form-success-container')) {
                                //console.log('data-form-success-container exists');
                                var formSuccessContainer = $(form).data('form-success-container');
                                $(formSuccessContainer).html(resp.message);

                            }
                            //$(form).find('.form-submitted-message .message').html(resp.message);
                        }
                    },
                    error: function () {
                        $(form).addClass('failed');
                    }
                };

                $(form).ajaxSubmit(options);
                return false;
            }
        });
    });


});





// Pages
require('./pages/default.js');

/*$(function () {
 $('.page-header-search__icon').on('click', function () {
 $('.page-header-search__input').focus();
 });
 });
 */