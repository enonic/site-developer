/**
 * Accessible + responsive tabs
 * Tor Løkken @ Enonic
 * https://enonic.com
 * Based on work by:
 * http://a11y.nicolas-hoffmann.net/tabs/
 * https://css-tricks.com/transformer-tabs/
 * http://lopatin.github.io/sliderTabs/
 */

(function ($) {
    function Tabs(element) {

        var that = this;
        that.tabs = element;
        // Store current URL hash.
        that.hash = window.location.hash.replace( "#", "" );

        this.init = function (options) {
            that.window = $(window);
            that.tabList = that.tabs.find('.js-tabs__list');
            that.tabItems = that.tabList.children('.js-tabs__item');
            that.tabLinks = that.tabItems.children('.js-tabs__link');
            that.panels = that.tabs.find('.js-tabs__panel');
            that.prefixClass = typeof options.prefixClass !== 'undefined' ? options.prefixClass + '-' : '';

            that.panelContainer = that.panels.wrapAll($('<div class="js-tabs__panels"/>')).parent();
            that.panelContainer.addClass(that.prefixClass + 'tabs__panels');


            this.initTabMenu();
            this.initTabLinks();
            this.initPanels();
            this.setActiveTab();

            this.bindEvents();


            /*setInterval(function() {
             if (that.selectedPanel) {
             if (that.selectedPanel.outerHeight() > that.panelContainer.outerHeight()) {
             resizePanelContainer(that.selectedPanel);
             }
             }

             }, 1000);*/


        };

        var resizePanelContainer = function(target) {
            that.panelContainer.animate({
                height: target.outerHeight()
            }, 200);

            //that.tabs.height(target.outerHeight() + that.tabList.outerHeight());

            that.tabs.animate({
                height: target.outerHeight() + that.tabList.outerHeight()
            }, 200);

        };

        this.bindEvents = function() {
            that.bindTabLinkClick();
            that.bindTabKeyDown();
            that.bindWindowResize();
        };

        this.initTabMenu = function() {
            that.tabList.attr('role', 'tablist');
            that.tabItems.attr('role', 'presentation');
            that.tabLinks.attr('role', 'tab');

            // classes init
            that.tabs.addClass(that.prefixClass + 'tabs');
            that.tabList.addClass(that.prefixClass + 'tabs__list' );
            that.tabItems.addClass(that.prefixClass + 'tabs__item' );
            that.tabLinks.addClass(that.prefixClass + 'tabs__link' );


            that.setTabListType();

            that.tabIndicator = $('<div/>');
            that.tabIndicator.addClass('js-tabs__indicator');
            that.tabIndicator.addClass(that.prefixClass + 'tabs__indicator' );
            that.tabIndicator.appendTo(that.tabList);
        };

        this.initTabLinks = function() {
            this.tabLinks.each(function() {
                var $this = $(this);
                var $href = $this.attr('href');
                var $controls = $($href);
                var $text = $this.html();

                /*if ( $hx !== "" ) {
                 $controls.prepend('<' + $hx + ' class="invisible" tabindex="0">' + $text + '</' + $hx + '>');
                 }
                 if ( $existing_hx !== "" ) {
                 $controls.find($existing_hx + ':first-child').attr('tabindex',0);
                 }*/

                if (typeof $href !== 'undefined' && $href !== '' && $href !== '#') {
                    $this.attr({
                        'aria-controls': $href.replace('#', ''),
                        'tabindex': -1,
                        'aria-selected': 'false'
                    });
                }

                $this.removeAttr('href');
            });
        };

        this.initPanels = function() {
            that.panels.attr({
                'role': 'tabpanel',
                'aria-hidden': 'true'
            });

            that.panels.each(function() {
                var $this = $(this);
                var $thisId = $this.attr('id');
                $this.attr('aria-labelledby', 'label_' + $thisId);
                $this.addClass ( that.prefixClass + 'tabs__panel');
            });
        };

        this.setActiveTab = function() {
            // search if hash is ON tabs

            if (that.hash !== "" && that.panels.filter('#' + that.hash).length !== 0 ) {
                that.selectedTabLink = that.tabLinks.filter('#tabs-label__' + that.hash);
                //    $( "#tabs-label__" + that.hash + ".js-tabs__link" );
                that.selectedPanel = that.panels.filter('#' + that.hash);
                //$( "#" + that.hash + ".js-tabs__panel" );

                //$( "#" + that.hash + ".js-tabs__content" ).removeAttr( "aria-hidden" );
                //that.showContent($( "#" + that.hash + ".js-tabs__content" ));
                //$( "#" + that.hash + ".js-tabs__content" ).attr( "aria-hidden", 'false');
                // selection menu
                /*$( "#tabs-label__" + that.hash + ".js-tabs__link" ).attr({
                 "aria-selected": "true",
                 "tabindex": 0
                 });*/
            }
            // search if hash is IN tabs
            /*else if ( that.hash !== "" && $( "#" + that.hash + ".js-tabs__panel" ).length === 0 && $( "#" + that.hash ).parents( '.js-tabs__panel' ).length ){

             //console.log('in tabs');
             var $this_hash = $( "#" + that.hash );
             var $tab_content_parent = $this_hash.parents( '.js-tabs__panel' );
             var $tab_content_parent_id = $tab_content_parent.attr( 'id' );

             //$tab_content_parent.removeAttr( "aria-hidden" );
             $tab_content_parent.attr('aria-hidden', 'false');
             // selection menu
             that.selectedTabLink = $( "#tabs-label__" + $tab_content_parent_id + ".js-tabs__link" );


             }*/
            else {
                that.selectedTabLink = that.tabLinks.eq(0);
                that.selectedPanel = that.panels.eq(0);
            }

            that.selectedTabItem = that.selectedTabLink.parent();

            that.selectedTabLink.attr({
                'aria-selected': 'true',
                'tabindex': 0
            }).parent().addClass('js-tabs__item--selected');

            that.showPanel(that.selectedPanel);




            that.positionIndicator();
        };

        this.bindTabLinkClick = function () {
            $(that.tabList).on('click', '.js-tabs__link', function(event) {
                var $this = $(this);

                if (that.tabListMode === 'vertical') {
                    if ($this[0] === that.selectedTabLink[0]) {
                        that.toggleVerticalMenu();
                    }
                    else {
                        that.closeVerticalMenu();
                    }
                }

                // If this is not the active selected tab
                if ($this[0] !== that.selectedTabLink[0]) {
                    var selectedTabItem = $this.parent();
                    var $hashToUpdate = $this.attr('aria-controls');
                    var $linkedPanel = $("#" + $this.attr( "aria-controls" ));

                    that.selectedTabItem.removeClass('js-tabs__item--selected');
                    that.selectedTabItem = selectedTabItem;
                    that.selectedTabItem.addClass('js-tabs__item--selected');

                    // aria selected false on all links
                    that.tabLinks.attr({
                        "tabindex": -1,
                        "aria-selected": "false"
                    });

                    // add aria selected on $this
                    $this.attr({
                        "aria-selected": "true",
                        "tabindex": 0
                    });

                    // Direction to slide panel on hide
                    var direction = (that.selectedTabLink.parent().index() < $this.parent().index()) ? 'left' : 'right';

                    that.selectedTabLink = $this;
                    that.positionIndicator();

                    // add aria-hidden on all tabs contents
                    //that.tabContent.attr( "aria-hidden", "true" );

                    // remove aria-hidden on tab linked
                    //$tabContentLinked.removeAttr( "aria-hidden" );
                    //$tabContentLinked.attr('aria-hidden', 'false');


                    /*that.tabContent.filter('[aria-hidden="false"]').animate({left: '-400px'}, 350, function() {
                     // add aria-hidden on all tabs contents
                     that.tabContent.attr('aria-hidden', 'true');
                     });*/





                    that.hidePanel(that.panels.filter('[aria-hidden="false"]'), direction);

                    that.showPanel($linkedPanel);

                    //resizePanelContainer($linkedPanel);
                    /*$tabContentLinked.attr('aria-hidden', 'false');
                     $tabContentLinked.animate({left:'0'},350, function() {

                     });*/

                    // add fragment (timeout for transitions)
                    setTimeout(function() {
                        history.pushState(null, null, location.pathname + location.search + '#' + $hashToUpdate);
                    }, 1000);
                }






                event.preventDefault();
            });
        };

        this.hidePanel = function(panel, direction) {
            panel.animate(
                panelAnimationCSS(that.tabs.width()).hide['slide' + direction],
                300, function() {
                    panel.attr('aria-hidden', 'true');
                    that.reorderPanels();
                });
        };

        this.showPanel = function(panel, direction) {
            that.selectedPanel = panel;

            resizePanelContainer(that.selectedPanel);
            panel.attr('aria-hidden', 'false');
            panel.animate(
                panelAnimationCSS(that.tabs.width()).show.slide,
                300, function() {
                    that.reorderPanels();
                });
        };

        this.reorderPanels = function() {

            var panelContainerWidth = that.panelContainer.width();

            //that.tabContent.filter('[aria-hidden="true"]').css('left', contentWidth + 'px');

            //that.tabItems

            that.tabItems.each(function(index, el) {
                var selectedIndex = that.tabItems.filter('.js-tabs__item--selected').index();
                var thisIndex = $(el).index();
                var panel = that.panels.eq(thisIndex);
                if (selectedIndex < thisIndex) {
                    panel.css({left: panelContainerWidth +'px'});
                }
                else if (selectedIndex > thisIndex) {
                    panel.css({left: '-' + panelContainerWidth +'px'});
                }
            });


            /* $tabsList.children('li').each(function(index, el){
             var selectedIndex = $tabsList.children('.selected').index(),
             thisIndex = $(el).index();
             var panel = $contentDivsContainer.children('#'+$(el).find('a').attr('href').substr(1));
             if(selectedIndex < thisIndex)
             panel.css({left: $contentDivsContainer.width()+'px'});
             else if(selectedIndex > thisIndex)
             panel.css({left: '-'+$contentDivsContainer.width()+'px'});
             else
             panel.addClass(settings.classes.panelActive);
             });*/
        };

        that.toggleVerticalMenu = function() {
            that.tabList.toggleClass('js-tabs__list--open ' + that.prefixClass + 'tabs__list--open');
        };

        that.closeVerticalMenu = function() {
            that.tabList.removeClass('js-tabs__list--open ' + that.prefixClass + 'tabs__list--open');
        };

        this.bindTabKeyDown = function () {
            $(that.tabList).on('keydown',  function(event) {

                //var $parent =  $(this).parents( '.js-tabs' );
                //var $activated = $parent.find( '.js-tabs__link[aria-selected="true"]' ).parent();
                var $activated = that.tabLinks.filter('[aria-selected="true"]').parent();
                var $lastLink = that.tabItems.last().find('.js-tabs__link');
                //var $lastLink = $parent.find( ".js-tabs__item:last-child .js-tabs__link" );
                //var $first_link = $parent.find( ".js-tabs__item:first-child .js-tabs__link" );

                var $firstLink = that.tabItems.eq(0).find('.js-tabs__link');
                var focusOnTabOnly = false;

                // some event should be activated only if the focus is on tabs (not on tabpanel)
                if ( $( document.activeElement ).is(that.tabs.find('.js-tabs__link') ) ){
                    focusOnTabOnly = true;
                }

                // catch keyboard event only if focus is on tab
                if (focusOnTabOnly && !event.ctrlKey) {
                    // strike up or left in the tab
                    if ( event.keyCode == 37 || event.keyCode == 38 ) {
                        // if we are on first => activate last
                        if ( $activated.is( ".js-tabs__item:first-child" ) ) {
                            $lastLink.click().focus();
                        }
                        // else activate previous
                        else {
                            $activated.prev().children( ".js-tabs__link" ).click().focus();
                        }
                        event.preventDefault();
                    }
                    // strike down or right in the tab
                    else if ( event.keyCode == 40 || event.keyCode == 39 ) {
                        // if we are on last => activate first
                        if ( $activated.is( ".js-tabs__item:last-of-type" ) ) {
                            $firstLink.click().focus();
                        }
                        // else activate next
                        else {
                            $activated.next().children( ".js-tabs__link" ).click().focus();
                        }
                        event.preventDefault();
                    }
                    else if ( event.keyCode == 36 ) {
                        // activate first tab
                        $firstLink.click().focus();
                        event.preventDefault();
                    }
                    else if ( event.keyCode == 35 ) {
                        // activate last tab
                        $lastLink.click().focus();
                        event.preventDefault();
                    }

                }

            });
        };


        this.positionIndicator = function() {
            if (that.selectedTabLink.length) {
                that.tabIndicator.css('left', that.selectedTabLink.position().left);
                that.tabIndicator.outerWidth(that.selectedTabLink.outerWidth());
            }

        };

        // Bind window resize
        this.bindWindowResize = function() {
            that.window.resize(function() {
                that.setTabListType();
                that.positionIndicator();
            });
        };

        this.setTabListType = function() {
            var totalTabItemWidth = 0;

            // Try setting horisontal (for resize up)
            that.tabList.removeClass('js-tabs__list--vertical ' + that.prefixClass + 'tabs__list--vertical');
            that.tabList.addClass('js-tabs__list--horisontal ' + that.prefixClass + 'tabs__list--horisontal');


            that.tabItems.each(function(index) {
                totalTabItemWidth += parseInt($(this).width(), 10);
            });

            if (that.tabList.innerWidth() < totalTabItemWidth) {
                that.tabListMode = 'vertical';
                that.tabList.removeClass('js-tabs__list--horisontal ' + that.prefixClass + 'tabs__list--horisontal');
                that.tabList.addClass('js-tabs__list--vertical ' + that.prefixClass + 'tabs__list--vertical');
            }
            else {
                that.tabListMode = 'horisontal';
                that.tabList.removeClass('js-tabs__list--vertical ' + that.prefixClass + 'tabs__list--vertical');
                that.tabList.addClass('js-tabs__list--horisontal ' + that.prefixClass + 'tabs__list--horisontal');
            }
        };

        // Object determining css properties to be animated to based on various actions, transitions, and directions
        var panelAnimationCSS = function(width){
            return {
                hide: {
                    slideleft: {
                        left: '-'+width+'px'
                    },
                    slideright: {
                        left: width+'px'
                    }
                },
                show: {
                    slide: {
                        left: 0
                    }
                }
            };
        };




    }

    $.fn.tabs = function (options) {
        return this.each(function () {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('tabs')) {
                return;
            }

            // pass options to plugin constructor
            var tabs = new Tabs(element);
            tabs.init(options);

            // Store plugin object in this element's data
            element.data('tabs', tabs);
        });
    };
})(jQuery);