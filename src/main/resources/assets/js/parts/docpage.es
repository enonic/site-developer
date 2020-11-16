$(function () {
    $('.docpage-menu__versions-select').change(function () {
        var url = $(this).find(":selected").attr('v-url');
        window.location.href = url;
    });

    let menuinput = $("#doc-menu-input");
    let menu = $("#doc-menu");
    menuinput.on("change", toggleMenu);
    // menu might be open on page laod
    toggleMenu();

    function toggleMenu() {
        if (menuinput.is(":checked")) {
            if (menu.hasClass("open-menu") == false) {
                menu.addClass("open-menu");
            }
            $('.docpage-content').css("overflow", "hidden");
            let scroll = $(window).scrollTop();
            let windowHeight = $(window).height();
            let height = $(document).height();
            if (scroll + windowHeight > height - 500) {
                menu.css({
                    "position": "fixed",
                    "width": "100%",
                });
            }
        } else {
            menu.removeClass("open-menu");
            menu.css({
                "position": "",
                "width": "",
            });
            $('.docpage-content').css("overflow", "");
        }
    }
});
