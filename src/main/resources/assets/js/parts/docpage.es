$(function () {
    $('.docpage-menu__versions-select').change(function () {
        var url = $(this).find(":selected").attr('v-url');
        window.location.href = url;
    });

    const headerHeight = $('.page-default__header-wrapper').height();
    const leftMenu = $('.docpage-menu');
    const menuWrapper = $('.docpage-menu-wrapper');

    const setMaxHeight = () => {
        const menuHeight = leftMenu.height();
        const menuWrapperHeight = menuWrapper.height();
        const windowHeight = window.innerHeight;
        const distanceFromTop = $(window).scrollTop();

        if (menuWrapperHeight + headerHeight < windowHeight) {
            leftMenu.css('max-height', '');
            return;
        }

        const minMenuHeight = windowHeight + distanceFromTop - headerHeight;

        if (menuWrapperHeight < menuHeight && menuWrapperHeight < minMenuHeight) {
            leftMenu.css('max-height', `${minMenuHeight}px`);
            return;
        }

        if (menuHeight + headerHeight >= windowHeight + distanceFromTop) {
            return;
        }

        if (menuHeight < minMenuHeight) {
            leftMenu.css('max-height', `${minMenuHeight}px`);
        }
    }

    if (leftMenu) {

        setMaxHeight();

        $(window).scroll(setMaxHeight);
        $('.docpage-menu-wrapper li label a').click(() => setMaxHeight());
        $('.docpage-menu-wrapper li>input').click(() => setMaxHeight());
    }
});
