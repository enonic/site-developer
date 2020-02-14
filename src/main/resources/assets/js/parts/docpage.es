$(function () {
    $('.docpage-menu__versions-select').change(function () {
        var url = $(this).find(":selected").attr('v-url');
        window.location.href = url;
    });

    const leftMenu = $('.docpage-menu');
    const pageWrapper = $('.page-default__content');
    const menuWrapper = $('.docpage-menu-wrapper');
    const minWrapperHeight = window.screen.height - pageWrapper.offset().top;
    let maxMenuHeight;
    let menuWrapperHeight = menuWrapper.height();

    const setMaxHeight = () => {
        const distanceFromTop = $(window).scrollTop();
        menuWrapperHeight = menuWrapper.height();
        maxMenuHeight = distanceFromTop + window.screen.height - pageWrapper.offset().top;
        leftMenu.attr('style', `max-height: ${maxMenuHeight}px;`);
    }

    const adjustMaxHeight = () => {
        const menuOffset = leftMenu.offset().top + leftMenu.height();
        const menuWrapperOffset = menuWrapper.offset().top + menuWrapper.height();
        console.log('Menu offset: ', leftMenu.offset().top + leftMenu.height());
        console.log('Menu wrapper offset: ', menuWrapper.offset().top + menuWrapper.height());
/*
        const currentMaxHeight = leftMenu.css('max-height');
        const newMaxHeight = menuWrapperOffset > menuOffset ? `${menuWrapperOffset - pageWrapper.offset().top}px` : '100vh';
*/
        const scrollTop = $(window).scrollTop();
        const windowSize = window.screen.height;

        if (scrollTop > 89)

        leftMenu.css('max-height', `${menuWrapperOffset - $(window).scrollTop()}px`);

        if (menuWrapperOffset === menuOffset) {
            return;
        }

        if (menuWrapperOffset > menuOffset) {
            leftMenu.css('max-height', `${menuWrapperOffset - pageWrapper.offset().top}px`);
        }/*
        else {
            leftMenu.css('max-height', '100vh');
        }*/

        /*
        const delta = menuWrapper.height() - menuWrapperHeight;
        menuWrapperHeight = menuWrapper.height();

        if (maxMenuHeight + delta < minWrapperHeight) {
            maxMenuHeight = minWrapperHeight
        }
        else
        {
            maxMenuHeight = maxMenuHeight + delta;
        }
        leftMenu.attr('style', `max-height: ${maxMenuHeight}px;`);
        */
    }

    if (leftMenu) {

        $(window).scroll(adjustMaxHeight);

        //setMaxHeight();

        $(window).resize(setMaxHeight);

        leftMenu.scroll(adjustMaxHeight);

        $('.docpage-menu-wrapper li label a').click(() => setTimeout(adjustMaxHeight, 100));
        $('.docpage-menu-wrapper li>input').click(() => setTimeout(adjustMaxHeight, 100));
    }

});
