// Click load pagination
(function ($) {
    function Responsive(element) {

        var that = this;

        this.init = function (ranges) {
            this.initResponsiveRanges(ranges);
            this.rangeValue = element.outerWidth();
            this.oldRangeValue = this.rangeValue;
            this.fitToRange();
            element.addClass(this.rangeSize.getRangeClass());
            window.addEventListener('availablesizechange', this.listener);
            window.addEventListener('resize', this.listener);
        };

        this.fitToRange = function () {
            that.responsiveRanges.every(function (range) {
                if (range.isFit(that.rangeValue)) {
                    that.rangeSize = range;
                    return false;
                }

                return true;
            });
        };

        this.listener = function () {
            var newRangeValue = element.outerWidth();
            that.oldRangeValue = that.rangeValue;
            that.oldRangeSize = that.rangeSize;
            if (newRangeValue !== that.rangeValue) {
                that.rangeValue = newRangeValue;
                element.removeClass(that.rangeSize.getRangeClass());
                that.fitToRange();
                element.addClass(that.rangeSize.getRangeClass());
            }
        };

        this.initResponsiveRanges = function (ranges) {
            this.responsiveRanges = [];
            if (ranges) {
                ranges.forEach(function (range) {
                    that.responsiveRanges.push(new ResponsiveRange(range[0], range[1]));
                });
            }
            else {
                this.responsiveRanges.push(new ResponsiveRange(0, 240));
                this.responsiveRanges.push(new ResponsiveRange(240, 375));
                this.responsiveRanges.push(new ResponsiveRange(375, 540));
                this.responsiveRanges.push(new ResponsiveRange(540, 720));
                this.responsiveRanges.push(new ResponsiveRange(720, 960));
                this.responsiveRanges.push(new ResponsiveRange(960, 1200));
                this.responsiveRanges.push(new ResponsiveRange(1200, 1380));
                this.responsiveRanges.push(new ResponsiveRange(1380, 1620));
                this.responsiveRanges.push(new ResponsiveRange(1620, 1920));
                this.responsiveRanges.push(new ResponsiveRange(1920, Infinity));
            }
        };

        function ResponsiveRange(minRange, maxRange) {
            this.minRange = minRange;
            this.maxRange = maxRange || 0;
            this.rangeClass = '_' + (minRange === 375 ? 360 : minRange) + '-' + (maxRange === 375 ? 360 : maxRange);

            this.getRangeClass = function () {
                return this.rangeClass;
            }

            this.isFit = function (size) {
                return (this.minRange <= size) && (size <= this.maxRange);
            }
        };
    }

    $.fn.responsive = function (ranges) {
        return this.each(function () {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('responsive')) {
                return;
            }

            // pass options to plugin constructor
            var responsive = new Responsive(element);
            responsive.init(ranges);

            // Store plugin object in this element's data
            element.data('responsive', responsive);
        });
    };
})(jQuery);