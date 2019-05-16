require('../plugins/modal.es');

$('.download-xp__download-modal--macos').modal({
    trigger: $('.download-xp__download-button--macos')
});

$('.download-xp__download-modal--windows').modal({
    trigger: $('.download-xp__download-button--windows')
});

$('.download-xp__download-modal--docker').modal({
    trigger: $('.download-xp__download-button--docker')
});

$('.download-xp__download-modal--other').modal({
    trigger: $('.download-xp__download-button--other')
});

// Add submitted class on download-xp modal cols
// This is used for hiding the col info when form is submitted (only show send receipt)
$(function() {
    $('.download-xp__download-modal-form').on('success', function() {
        var $colContainer = $(this).closest('.download-xp__download-modal-cols');
        $colContainer.addClass('download-xp__download-modal-cols--submitted');
    });
});
