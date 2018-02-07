$(() => {
    $('.docpage-menu__versions-select').change(() => {
        const url = $(this).find(':selected').attr('v-url');
        window.location.href = url;
    });
});
