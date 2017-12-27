$(function () {

    $('.docpage__header-version-select').change(function () {
        var url = $(this).find(":selected").attr('v-url');
        window.location.href = url;
    });

});