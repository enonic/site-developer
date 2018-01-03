$(function () {

    $('.doc-versions-fragment__select').change(function () {
        var url = $(this).find(":selected").attr('v-url');
        window.location.href = url;
    });

});
