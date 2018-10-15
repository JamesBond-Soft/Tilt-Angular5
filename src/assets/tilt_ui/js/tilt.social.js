/* ============================================================
 * Pages Social
 * ============================================================ */

(function($) {

    'use strict';

    // SOCIAL CLASS DEFINITION
    // ======================

    var Social = function(element, options) {
        this.element = pg.queryElement(element);
        this.defaults = {
            cover: '[data-social="cover"]',
            day: '[data-social="day"]',
            status: '[data-social="status"]',
            item: '[data-social="item"]',
            colWidth: 300
        }
        this.options = pg.extend(this.defaults,options);
        this.day =
            this.resizeTimeout =
            this.columns =
            this.colWidth = null;
        this.init();
    }
    Social.VERSION = "1.0.0";

    Social.prototype = {
        init: function() {
            this.cover = this.element.querySelector(this.options.cover);
            this.day = this.element.querySelector(this.options.day);
            this.item = this.element.querySelector(this.options.item);
            this.status = this.element.querySelector(this.options.status);
            this.colWidth = this.options.colWidth;

            var _this = this;

            // TODO: transition disabled for mobile (animation starts after touch end)
        
            // Dependency: stepsForm 
            if (typeof stepsForm != 'undefined') {
                this.status.length && new stepsForm(this.status, {
                    onSubmit: function(form) {
                        pg.addClass(_this.status.querySelector('.status-form-inner'),'hide');
                        // form.submit()
                        // show success message
                        var finalMessage  = _this.status.querySelector('.final-message');
                        if(finalMessage) finalMessage.innerHTML = '<i class="fa fa-check-circle-o"></i> Status updated';
                        pg.addClass(finalMessage,'show')
                    }
                });


            }
            // Prevent 'vh' bug on iOS7
            if(pg.getUserAgent() == 'mobile'){
                //var wh = $(window).height();
                if(this.cover) this.cover.style.height ="400px";
            }
           
            setTimeout(function() {
                if(!this.day) return;
                var iso = new Isotope(this.day, {
                    "itemSelector": this.options.item,
                    "masonry": {
                        "columnWidth": this.colWidth,
                        "gutter": 20,
                        "isFitWidth": true
                    }
                });
               //_this.$day.isotope('layout');
            }.bind(this), 500);

        },

        // Set container width in order to align it horizontally. 

        setContainerWidth: function() {
            var currentColumns = Math.floor((document.width - 100) / this.colWidth);
            if (currentColumns !== this.columns) {
                // set new column count
                this.columns = currentColumns;
                // apply width to container manually, then trigger relayout
                if(this.day) this.day.style.width = this.columns * (this.colWidth + 20);
            }
        }
    }
    //@TODO : and EVENTS
    // SOCIAL DATA API
    //===================
    document.addEventListener("DOMContentLoaded", function(event) {
        var socialEl = document.querySelectorAll('[data-pages="social"]');
        [].forEach.call(socialEl, function(el) {
            new Social(el,el.dataset);
            setTimeout(function() {
                el.querySelector('[data-social="status"] li.current input').focus();
            }, 1000);
        });
    });
    window.addEventListener("optimizedResize", function() {

    });

    // $(window).on('resize', function() {
    //     $('[data-pages="social"]').each(function() {
    //         var $social = $(this);

    //         clearTimeout($social.data('pg.social').resizeTimeout);

    //         $social.data('pg.social').resizeTimeout = setTimeout(function() {
    //             // $social.data('pg.social').setContainerWidth();
    //             $social.data('pg.social').$day.isotope('layout');
    //         }, 300);

    //     });

    // });


})(window.jQuery);