/**
 * morphingTime.js
 * @fileOverview An easy to use Morphing Overlay Buttons library
 * @author Mark Christian D. Lopez <mark@ypdigital.com.au><xmarkclx@gmail.com>
 *
 * Based on Codrops uiMorphingButton_fixed.js v1.0.0
 * http://www.codrops.com
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

;( function( window ) {
    'use strict';

    var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'msTransition': 'MSTransitionEnd',
            'transition': 'transitionend'
        },
        transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
        support = { transitions : Modernizr.csstransitions };

    function cloneElement(el, newId){
        return $(el).clone().prop({ id: newId });
    }

    function cloneElementToNewParent(el, newParent, newId){
        var clone = $(el).clone().prop({ id: newId });
        $(newParent).append(clone);
    }

    function extend( a, b ) {
        for( var key in b ) {
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

    function UIMorphingButton( el, options ) {
        console.log(el);
        this.el = el;
        $(el).data('isMorphing', '1');
        this.options = extend( {}, this.options );
        extend( this.options, options );
        this._init();
    }

    UIMorphingButton.prototype.options = {
        closeEl : '',
        onBeforeOpen : function() { return false; },
        onAfterOpen : function() { return false; },
        onBeforeClose : function() { return false; },
        onAfterClose : function() { return false; }
    };

    UIMorphingButton.prototype._init = function() {
        // the button
        this.button = this.el.querySelector( 'button' );
        // state
        this.expanded = false;
        // content el
        this.contentEl = this.el.querySelector( '.morph-content' );
        // init events
        this._initEvents();
    };

    UIMorphingButton.prototype._initEvents = function() {
        var self = this;
        // open
        if($(this.el).hasClass('morphing-cloned')){
            this.button.addEventListener( 'click', function() { self.toggleCloned(); } );
        }else{
            this.button.addEventListener( 'click', function() { self.toggle(); } );
        }
        // close
        if( this.options.closeEl !== '' ) {
            var closeEl = this.el.querySelector( this.options.closeEl );
            if( closeEl ) {
                if($(this.el).hasClass('morphing-cloned')){
                    closeEl.addEventListener( 'click', function() { self.toggleCloned(); } );
                }else{
                    closeEl.addEventListener( 'click', function() { self.toggle(); } );
                }
            }
        }
    };

    UIMorphingButton.prototype.toggle = function() {
        if( this.isAnimating ) return false;

        // callback
        if( this.expanded ) {
            this.options.onBeforeClose();
        }
        else {
            // add class active (solves z-index problem when more than one button is in the page)
            classie.addClass( this.el, 'active' );
            //$(this.contentEl).width($(this.button).width());
            //$(this.contentEl).height($(this.button).height());
            this.options.onBeforeOpen();
        }

        this.isAnimating = true;

        var self = this,
            onEndTransitionFn = function( ev ) {
                if( ev.target !== this ) return false;

                if( support.transitions ) {
                    // open: first opacity then width/height/left/top
                    // close: first width/height/left/top then opacity
                    if( self.expanded && ev.propertyName !== 'opacity' || !self.expanded && ev.propertyName !== 'width' && ev.propertyName !== 'height' && ev.propertyName !== 'left' && ev.propertyName !== 'top' ) {
                        return false;
                    }
                    this.removeEventListener( transEndEventName, onEndTransitionFn );
                }
                self.isAnimating = false;

                // callback
                if( self.expanded ) {
                    // remove class active (after closing)
                    classie.removeClass( self.el, 'active' );
                    self.options.onAfterClose();
                }
                else {
                    self.options.onAfterOpen();
                }

                self.expanded = !self.expanded;
            };

        if( support.transitions ) {
            this.contentEl.addEventListener( transEndEventName, onEndTransitionFn );
        }
        else {
            onEndTransitionFn();
        }

        // set the left and top values of the contentEl (same like the button)
        var buttonPos = this.button.getBoundingClientRect();
        // need to reset
        classie.addClass(this.contentEl, 'no-transition');

        this.contentEl.style.left = 'auto';
        this.contentEl.style.top = 'auto';

        // add/remove class "open" to the button wraper
        setTimeout( function() {
            self.contentEl.style.left = buttonPos.left + 'px';
            self.contentEl.style.top = buttonPos.top + 'px';

            // self.contentEl.style.height = buttonPos.height + 'px';
            // self.contentEl.style.width = buttonPos.width + 'px';

            if( self.expanded ) {
                classie.removeClass( self.contentEl, 'no-transition' );
                classie.removeClass( self.el, 'open' );
            }
            else {
                setTimeout( function() {
                    classie.removeClass( self.contentEl, 'no-transition' );
                    classie.addClass( self.el, 'open' );
                }, 25 );
            }
        }, 25 );
    };


    UIMorphingButton.prototype.toggleCloned = function() {
        if( this.isAnimating ) return false;

        // callback
        if (this.expanded) {
            this.options.onBeforeClose();
        }
        else {
            // Generate the clone to avoid the problems with stacking contexts.
            $('#active-morph-button').remove();
            var clone = cloneElement(this.el, 'active-morph-button');
            clone.css('opacity', 0);
            clone.css('z-index', 999999);
            var el = $(this.el);
            var originalPositionTop = el.offset().top - $(window).scrollTop();
            var originalPositionLeft = el.find('button').offset().left  - $(window).scrollLeft();
            var originalWidth = el.find('button').outerWidth();
            var originalHeight = el.find('button').outerHeight();
            clone.css('top', originalPositionTop);
            clone.css('left', originalPositionLeft);
            clone.css('width', originalWidth);
            clone.css('height', originalHeight);
            clone.find('button').css('width', originalWidth);
            clone.find('button').css('height', originalHeight);
            clone.css('position', 'fixed');
            $('body').append(clone);
            clone.find('.morph-content').remove();
            clone.append(this.contentEl);
            var cloneContentEl = clone.find('.morph-content');
            cloneContentEl.css('top', originalPositionTop);
            cloneContentEl.css('left', originalPositionLeft);
            cloneContentEl.css('width', originalWidth);
            cloneContentEl.css('height', originalHeight);
            cloneContentEl.css('padding', 0);
            clone.find('button').css('color', 'transparent!important');
            clone.css('opacity', 1);
            this.clone = $(clone)[0];
            this.cloneContentEl = $(cloneContentEl)[0];

            // add class active (solves z-index problem when more than one button is in the page)
            classie.addClass( this.clone, 'active' );
            //$(this.contentEl).width($(this.button).width());
            //$(this.contentEl).height($(this.button).height());
            this.options.onBeforeOpen();
        }

        this.isAnimating = true;

        var self = this,
            onEndTransitionFn = function( ev ) {
                if( ev.target !== this ) return false;

                if( support.transitions ) {
                    // open: first opacity then width/height/left/top
                    // close: first width/height/left/top then opacity
                    if( self.expanded && ev.propertyName !== 'opacity' || !self.expanded && ev.propertyName !== 'width' && ev.propertyName !== 'height' && ev.propertyName !== 'left' && ev.propertyName !== 'top' ) {
                        return false;
                    }
                    this.removeEventListener( transEndEventName, onEndTransitionFn );
                }
                self.isAnimating = false;

                // callback
                if( self.expanded ) {
                    // remove class active (after closing)
                    classie.removeClass( self.clone, 'active' );
                    // remove clone
                    $(self.clone).hide();
                    self.options.onAfterClose();
                }
                else {
                    self.options.onAfterOpen();
                }

                self.expanded = !self.expanded;
            };

        $(cloneContentEl).find(this.options.closeEl).click(function() { console.log(self); self.toggleCloned(); } );

        if( support.transitions ) {
            console.log(this.cloneContentEl);
            this.cloneContentEl.addEventListener( transEndEventName, onEndTransitionFn );
        }
        else {
            onEndTransitionFn();
        }

        // set the left and top values of the contentEl (same like the button)
        var buttonPos = this.button.getBoundingClientRect();
        // need to reset
        classie.addClass(this.cloneContentEl, 'no-transition');

        this.contentEl.style.left = 'auto';
        this.contentEl.style.top = 'auto';

        // add/remove class "open" to the button wraper
        setTimeout( function() {
            self.contentEl.style.left = buttonPos.left + 'px';
            self.contentEl.style.top = buttonPos.top + 'px';

            // self.contentEl.style.height = buttonPos.height + 'px';
            // self.contentEl.style.width = buttonPos.width + 'px';

            if( self.expanded ) {
                classie.removeClass( self.cloneContentEl, 'no-transition' );
                classie.removeClass( self.clone, 'open' );
            }
            else {
                setTimeout( function() {
                    classie.removeClass( self.cloneContentEl, 'no-transition' );
                    classie.addClass( self.clone, 'open' );
                }, 25 );
            }
        }, 25 );
    };

    // add to global namespace
    window.UIMorphingButton = UIMorphingButton;

})( window );

/**
 * START
 **/

(function () {
    // trick to prevent scrolling when opening/closing button
    function noScrollFn() {
        window.scrollTo( scrollPosition ? scrollPosition.x : 0, scrollPosition ? scrollPosition.y : 0 );
    }

    function noScroll() {
        window.removeEventListener( 'scroll', scrollHandler );
        window.addEventListener( 'scroll', noScrollFn );
    }

    function scrollFn() {
        window.addEventListener( 'scroll', scrollHandler );
    }

    function canScroll() {
        window.removeEventListener( 'scroll', noScrollFn );
        scrollFn();
    }

    function scrollHandler() {
        if( !didScroll ) {
            didScroll = true;
            setTimeout( function() { scrollPage(); }, 60 );
        }
    }

    function scrollPage() {
        scrollPosition = { x : window.pageXOffset || docElem.scrollLeft, y : window.pageYOffset || docElem.scrollTop };
        didScroll = false;
    }

    function handleStaticSize(){
        $('.morph-content').each(function() {
            $(this).css('width', $(this).parent().find('button').outerWidth());
            $(this).css('height', $(this).parent().find('button').outerHeight());
        });
    }

    function readyMorphButtons(){
        $('.morph-button, .morph-content').hide();

        scrollFn();

        $('.morph-button').each(function(){
            new UIMorphingButton($(this)[0], {
                closeEl: '.icon-close',
                onBeforeOpen: function () {
                    // don't allow to scroll
                    noScroll();
                },
                onAfterOpen: function () {
                    // can scroll again
                    canScroll();
                },
                onBeforeClose: function () {
                    // don't allow to scroll
                    noScroll();
                },
                onAfterClose: function () {
                    // can scroll again
                    canScroll();
                }
            });
        });

        handleStaticSize();

        $(window).resize(function(){
            handleStaticSize();
        });

        $(document).ready(function(){
            handleStaticSize();
            setTimeout(function(){
                handleStaticSize();
            }, 300)
        });

        $('.morph-button, .morph-content').show();
    }


    function makeMorphButton(el){
        new UIMorphingButton(el, {
            closeEl: '.icon-close',
            onBeforeOpen: function () {
                // don't allow to scroll
                noScroll();
            },
            onAfterOpen: function () {
                // can scroll again
                canScroll();
            },
            onBeforeClose: function () {
                // don't allow to scroll
                noScroll();
            },
            onAfterClose: function () {
                // can scroll again
                canScroll();
            }
        });
    }

    var docElem = window.document.documentElement, didScroll, scrollPosition;

    readyMorphButtons();
    window.readyMorphButtons = readyMorphButtons;
    window.makeMorphButton = makeMorphButton;
})();

function readyMorphButtons() {
    $('.morph-button, .morph-content').hide();

    scrollFn();

    $('.morph-button').each(function () {
        new UIMorphingButton($(this)[0], {
            closeEl: '.icon-close',
            onBeforeOpen: function () {
                // don't allow to scroll
                noScroll();
            },
            onAfterOpen: function () {
                // can scroll again
                //console.log(typeof(window.morphAfterOpen));
                //if(typeof(window.morphAfterOpen) != 'undefined')
                //    window.morphAfterOpen();
                canScroll();
            },
            onBeforeClose: function () {
                // don't allow to scroll
                noScroll();
            },
            onAfterClose: function () {
                // can scroll again
                canScroll();
            }
        });
    });

    handleStaticSize();

    $(window).resize(function () {
        handleStaticSize();
    });

    $(document).ready(function () {
        handleStaticSize();
        setTimeout(function () {
            handleStaticSize();
        }, 300)
    });

    $('.morph-button, .morph-content').show();
}

function makeMorphButton(){

}
