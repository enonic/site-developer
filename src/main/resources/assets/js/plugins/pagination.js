// Click load pagination
(function ($) {
    function Pagination(element) {

        this.list = element;

        this.init = function () {
            this.paginationUrl = this.list.data('pagination-url');
            this.paginationStart = this.list.data('pagination-start');
            this.paginationCount = this.list.data('pagination-count');
            this.paginationTotal = this.list.data('pagination-total');
            this.updatePaginationStart();
            this.addButton();
        };

        this.addButton = function () {
            if (this.paginationTotal > this.paginationCount) {
                this.createLoadMoreButton();
            }
        };

        this.createLoadMoreButton = function () {
            this.button = $('<button class="btn btn--pagination"/>');
            this.button.text('Load more');
            this.bindLoadMoreClick();
            this.list.after(this.button);
        };

        this.bindLoadMoreClick = function () {
            var that = this;
            this.button.click(function () {
                that.loadNextPage();
            });
        };

        this.loadNextPage = function () {
            var that = this;
            this.button.addClass('loading');
            var url = this.createPaginationUrl();
            //console.log(url);
            $.get(url, function (data) {
                $(data).appendTo(that.list);
                that.updatePaginationStart();
                that.button.removeClass('loading');
            });
        };

        this.createPaginationUrl = function () {
            var url = this.paginationUrl;
            var start = this.paginationStart;
            var param = 's=' + start;
            url += (url.split('?')[1] ? '&' : '?') + param;
            return url;
        };

        this.updatePaginationStart = function () {
            var newStart = this.paginationStart + this.paginationCount;
            this.paginationStart = newStart;
            if (newStart >= this.paginationTotal) {
                this.removeLoadMoreButton();
            }
        };

        this.removeLoadMoreButton = function () {
            if (this.button) {
                this.button.remove();
            }
        };
    }

    $.fn.pagination = function (options) {
        return this.each(function () {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('pagination')) {
                return;
            }

            // pass options to plugin constructor
            var pagination = new Pagination(element);
            pagination.init();

            // Store plugin object in this element's data
            element.data('pagination', pagination);
        });
    };
})(jQuery);