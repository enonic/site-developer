$(function () {

    $('.docpage__header-version-select').change(function () {
        var url = $(this).find(":selected").attr('v-url');
        window.location.href = url;
    });

    $('.docpage__header').each(function (i) {
        var docHeader = this;
        var docHeaderMargin = parseInt(window.getComputedStyle(docHeader).getPropertyValue('margin-bottom'));
        var docHeaderHeight = docHeader.getBoundingClientRect().height + docHeaderMargin;
        var sticky = docHeader.offsetTop;
        var docContent = docHeader.nextElementSibling;
        var toc = docContent.querySelector('.toc');

        window.addEventListener('scroll', updateHeader);
        window.addEventListener('availablesizechange', updateHeader);
        window.addEventListener('resize', updateHeader);

        function updateHeader() {
            if (window.pageYOffset >= sticky) {
                makeHeaderSticky()
            } else {
                makeHeaderStatic();
            }
        }

        function makeHeaderSticky() {
            docHeader.classList.add('sticky');
            docContent.style.paddingTop = docHeaderHeight + 'px';
            docHeader.style.width = docContent.getBoundingClientRect().width + 'px';
            toc.style.top = docHeaderHeight + 'px';
        }

        function makeHeaderStatic() {
            docHeader.classList.remove('sticky');
            docContent.style.paddingTop = '';
            docHeader.style.width = '';
            toc.style.top = '';
        }
    });

});
