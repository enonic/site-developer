$(function () {
    $(".docpage-menu__versions-select").on("change", function () {
        var url = $(this).find(":selected").attr("v-url");
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
            $(document.body).css("overflow", "hidden");
        } else {
            menu.removeClass("open-menu");
            $(document.body).css("overflow", "");
        }
    }
});
