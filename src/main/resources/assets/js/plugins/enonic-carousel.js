/**
 * Inspired by and based on http://www.w3.org/WAI/tutorials/carousels/
 */

(function ($) {
    function EnoniCarousel(element) {

        "use strict";

        var that = this;

        // Some variables for the instance of the carousel
        var carousel = element,
            slides,
            index,
            slideNav,
            settings,
            timer,
            setFocus,
            animationSuspended,
            announceSlide = false;

        this.init = function (options) {

            settings = options;
            slides = carousel.find('.enonicarousel__slide');



            imagesLoaded(slides.find('img')).done(function() {
                setCarouselHeight();
            });


            //setCarouselHeight();

            if (slides.length > 1) {
                createControls();
                createSlideNav();
                bindEvents();
            }


            // Set the index (=current slide) to 0 – the first slide
            index = 0;
            setSlides(index);

            // If the carousel is animated, advance to the
            // next slide after 5s
            if (settings.startAnimated) {
                timer = setTimeout(that.nextSlide, 5000);
            }



        };

        function bindEvents() {

            // Register a transitionend event so the slides can be
            // hidden after the transition
            slides.first().parent().on('transitionend', function (event) {
                var slide = $(event.target);
                slide.removeClass('enonicarousel__slide--in-transition');

                if (slide.hasClass('enonicarousel__slide--current')) {
                    // Also, if the global setFocus variable is set
                    // and the transition ended on the current slide,
                    // set the focus on this slide.
                    if (setFocus) {
                        // This is done if the user clicks a slidenav button.
                        slide.attr('tabindex', '-1');
                        slide.focus();
                        setFocus = false;
                    }
                    if (announceSlide) {
                        slide.removeAttr('aria-live');
                        announceSlide = false;
                    }
                }
            });

            // Suspend the animation if the mouse enters the carousel
            // or if an element of the carousel (that is not the current
            // slide) receives focus.
            // (Re-)start animation when the mouse leaves or the focus
            // is removed.
            carousel.on('mouseenter', suspendAnimation);
            carousel.on('mouseleave', startAnimation);

            carousel.on('focusin', function() {
                if ($(this).hasClass('enonicarousel__slide')) {
                    suspendAnimation();
                }
            });

            carousel.on('focusout', function() {
                if ($(this).hasClass('enonicarousel__slide')) {
                    startAnimation();
                }
            });

            // Recalculate/reset carousel height when window is resized
            $(window).resize(function() {
                setCarouselHeight();
            });
        }

        function setCarouselHeight() {
            var maxHeight = 0;

            //console.log('setcarouselheight');

            slides.each(function() {
                if ($(this).innerHeight() > maxHeight) {
                    maxHeight = $(this).innerHeight();
                }
            });

            //console.log('maxheight: ' + maxHeight);

            carousel.innerHeight(maxHeight);


        }

        /**
         * Adds buttons for next/prev slide to carousel
         */
        function createControls() {
            var ctrl = $('<ul class="enonicarousel__ctrl"/>');
            var prevBtn = $('<button class="enonicarousel__ctrl-btn enonicarousel__ctrl-btn--prev"><span class="enonicarousel__ctrl-btn-text">Previous slide</span></button>');
            var nextBtn = $('<button class="enonicarousel__ctrl-btn enonicarousel__ctrl-btn--next"><span class="enonicarousel__ctrl-btn-text">Next slide</span></button>');

            prevBtn.on('click', prevSlide);
            nextBtn.on('click', nextSlide);

            ctrl.append($('<li/>').append(prevBtn));
            ctrl.append($('<li/>').append(nextBtn));

            carousel.append(ctrl);
        }

        function createSlideNav() {
            // Add list of slides and/or play/pause button
            if (settings.slideNav || settings.animate) {
                slideNav = $('<ul class="enonicarousel__nav"/>');

                var li = $('<li class="enonicarousel__nav-item"/>');

                if (settings.animate) {

                    // Add Play/Pause button if the slider is animated

                    var playBtn = $('<button class="enonicarousel__nav-btn enonicarousel__nav-btn--play"/>');
                    var playBtnText = $('<span class="visually-hidden"/>');

                    if (settings.startAnimated) {
                        playBtn.attr('data-stop', true);
                        playBtnText.html('Stop animation');
                    }
                    else {
                        playBtn.attr('data-start', true);
                        playBtnText.html('Start animation');
                    }

                    playBtn.append(playBtnText);
                    li.append(playBtn);
                    slideNav.append(li);
                }

                if (settings.slideNav) {
                    slides.each(function (i, value) {
                        var li = $('<li class="enonicarousel__nav-item"/>');
                        var btn = $('<button class="enonicarousel__nav-btn enonicarousel__nav-btn--slide" data-slide="' + i + '">');
                        var btnContent = $('<span class="visually-hidden">Slide</span><span class="enonicarousel__nav-num">' + (i+1) + '</span>');
                        if (i===0) {
                            btn.addClass('enonicarousel__nav-btn--current');
                            btnContent.append($(' <span class="visually-hidden">(Current Slide)</span>'));
                        }

                        btn.append(btnContent);
                        li.append(btn);
                        slideNav.append(li);

                    });
                }

                // Register click event on the slidenav
                // Vanilla event listener due to event capture
                slideNav.get(0).addEventListener('click', function(event) {
                    var button = $(event.target);
                    if (button.is('button')) {
                        if (button.is('[data-slide]')) {
                            // If the button is from the slide list,
                            // stop the animation and go to the slide
                            stopAnimation();
                            setSlides(button.attr('data-slide'), true);
                        } else if (button.is('[data-stop]')) {
                            // Stop animation if the stop button is activated
                            stopAnimation();
                        } else if (button.is('[data-start]')) {
                            // Start animation if the stop button is activated
                            startAnimation();
                        }
                    }
                }, true);

                carousel.addClass('enonicarousel--with-slidenav');
                carousel.append(slideNav);
            }
        }

        // Function to set a slide the current slide
        function setSlides(newCurrentIndex, focus, transition) {
            // Both, focus and transition are optional parameters.
            // focus denotes if the focus should be set after the
            // carousel advanced to slide number new_current.
            // transition denotes if the transition is going into the
            // next or previous direction.
            // Here defaults are set:
            setFocus = typeof focus !== 'undefined' ? focus : false;
            transition = typeof transition !== 'undefined' ? transition : 'none';

            newCurrentIndex = parseFloat(newCurrentIndex);

            var numSlides = slides.length;
            var newNextIndex = newCurrentIndex+1;
            var newPrevIndex = newCurrentIndex-1;

            // If the next slide number is equal to the length,
            // the next slide should be the first one of the slides.
            // If the previous slide number is less than 0.
            // the previous slide is the last of the slides.
            if(newNextIndex === numSlides) {
                newNextIndex = 0;
            } else if(newPrevIndex < 0) {
                newPrevIndex = numSlides-1;
            }

            // Reset slide classes
            //slides.attr('class', 'enonicarousel__slide');
            slides.removeClass('enonicarousel__slide--current enonicarousel__slide--next enonicarousel__slide--prev enonicarousel__slide--in-transition');

            // Add classes to the previous, next and current slide
            var nextSlide = slides.eq(newNextIndex);
            nextSlide.addClass('enonicarousel__slide--next');
            if (transition == 'next') {
                nextSlide.addClass('enonicarousel__slide--in-transition');
                nextSlide.attr('aria-hidden', 'true');
            }

            var prevSlide = slides.eq(newPrevIndex);
            prevSlide.addClass('enonicarousel__slide--prev');
            if (transition == 'prev') {
                prevSlide.addClass('enonicarousel__slide--in-transition');
                slides.eq(newNextIndex).attr('aria-hidden', 'true');
            }

            var newCurrentSlide = slides.eq(newCurrentIndex);
            newCurrentSlide.addClass('enonicarousel__slide--current');
            newCurrentSlide.removeAttr('aria-hidden');

            if (announceSlide) {
                newCurrentSlide.attr('aria-live', 'polite');
            }

            // Update the slidenav buttons
            if(settings.slideNav) {
                var buttons = carousel.find('.enonicarousel__nav-btn[data-slide]');
                var currentBtn = carousel.find('.enonicarousel__nav-btn--current');
                currentBtn.removeClass('enonicarousel__nav-btn--current');
                // The current slide visually impaired text
                var currentSlideSpan = currentBtn.find('span').last();


                var newCurrent = buttons.eq(newCurrentIndex);
                newCurrent.addClass('enonicarousel__nav-btn--current');
                newCurrent.append(currentSlideSpan);

                /*buttons.each(function(index, value) {
                    $(this).removeClass('.enonicarousel__nav-btn--current');
                    $(this).html('<span class="visually-hidden">Slide</span> ' + (index+1));
                });*/
                //buttons.eq(new_current).attr('class', 'enonicarousel__nav-btn--current');
                //buttons.eq(new_current).html('<span class="visually-hidden">Slide</span> ' + (new_current+1) + ' <span class="visually-hidden">(Current Slide)</span>');
            }

            // Set the global index to the new current value
            index = newCurrentIndex;

        }

        /**
         * Advance to next slide
         */
        function nextSlide() {

            var numSlides = slides.length,
                newCurrentIndex = index + 1;

            if(newCurrentIndex === numSlides) {
                newCurrentIndex = 0;
            }

            announceSlide = true;

            // If we advance to the next slide, the previous needs to be
            // visible to the user, so the third parameter is 'prev', not
            // next.
            setSlides(newCurrentIndex, false, 'prev');

            // If the carousel is animated, advance to the next
            // slide after 5s
            if (settings.animate) {
                timer = setTimeout(nextSlide, 5000);
            }
        }

        /**
         * Advance to previous slide
         */
        function prevSlide() {
            var numSlides = slides.length,
                newCurrentIndex = index - 1;

            if(newCurrentIndex < 0) {
                newCurrentIndex = numSlides-1;
            }

            announceSlide = true;

            // If we advance to the previous slide, the next needs to be
            // visible to the user, so the third parameter is 'next', not
            // prev.
            setSlides(newCurrentIndex, false, 'next');

        }

        /**
         * Stops the animation
         */
        function stopAnimation() {
            clearTimeout(timer);
            settings.animate = false;
            animationSuspended = false;
            var _this = carousel.find('[data-stop], [data-start]');
            _this.html('<span class="visually-hidden">Start Animation </span>');
            _this.removeAttr('data-stop');
            _this.attr('data-start', 'true');
        }

        /**
         * Starts the animation
         */
        function startAnimation() {
            settings.animate = true;
            animationSuspended = false;
            timer = setTimeout(function () {
                nextSlide();
            }, 5000);
            var _this = carousel.find('[data-stop], [data-start]');
            _this.html('<span class="visually-hidden">Stop Animation </span>');
            _this.attr('data-stop', 'true');
            _this.removeAttr('data-start');
        }

        /**
         * Suspends/pauses the animation
         */
        function suspendAnimation() {
            if(settings.animate) {
                clearTimeout(timer);
                settings.animate = false;
                animationSuspended = true;
            }
        }

        function imagesLoaded(allImgs) {

            var allImgsLength = allImgs.length;
            var allImgsLoaded = 0;

            var deferred = $.Deferred();

            $.each(allImgs, function (i, img) {

                var image = new Image();
                //var events = 'load.' + eventNamespace + ' error.' + eventNamespace;
                var events = 'load error';


                // Handle the image loading and error with the same callback.
                $(image).one(events, function me (event) {
                    // If an error occurred with loading the image, set the
                    // third argument accordingly.
                    var eachArguments = [
                        allImgsLoaded,
                        allImgsLength,
                        event.type == 'load'
                    ];
                    allImgsLoaded++;

                    //eachCallback.apply(img.element, eachArguments);
                    deferred.notifyWith(img.element, eachArguments);

                    // Unbind the event listeners. I use this in addition to
                    // `one` as one of those events won't be called (either
                    // 'load' or 'error' will be called).
                    $(this).off(events, me);

                    if (allImgsLoaded == allImgsLength) {
                        //finishedCallback.call(obj[0]);
                        deferred.resolveWith(allImgs);
                        return false;
                    }

                });

                image.src = img.src;
            });

            return deferred.promise();
        }

    }

    $.fn.enoniCarousel = function (options) {
        return this.each(function () {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('enoniCarousel')) {
                return;
            }

            // pass options to plugin constructor
            var enoniCarousel = new EnoniCarousel(element);
            enoniCarousel.init(options);

            // Store plugin object in this element's data
            element.data('enoniCarousel', enoniCarousel);
        });
    };
})(jQuery);