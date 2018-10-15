/*
*   Pages plugins
*/

var listViews = document.querySelectorAll('[data-pages="list-view"]');
listViews.forEach(function(element){
    new pg.ListView(element);
});

var MobileView = document.querySelectorAll('[data-navigate="view"]');
MobileView.forEach(function(element){
    new pg.MobileView(element);
});

var Parallax = document.querySelectorAll('[data-pages="parallax"]');
Parallax.forEach(function(element){
    new pg.Parallax(element);
});

var Progress = document.querySelectorAll('[data-pages-progress="circle"]');
Progress.forEach(function(element){
    new pg.Progress(element);
});

var Quickviews = document.querySelectorAll('[data-pages="quickview"]');
Quickviews.forEach(function(element){
    new pg.Quickview(element);
});

var SideBars = document.querySelectorAll('[data-pages="sidebar"]');
SideBars.forEach(function(element){
    new pg.SideBar(element);
});

var Selects = document.querySelectorAll('select[data-init-plugin="cs-select"]');
Selects.forEach(function(element){
    new pg.Select(element);
});

/*
*    Third party plugins 
*/

/** @function initDropDown
    * @description Initialize Boot-Strap dropdown Menue
    * @param {(Element|JQuery)} [context] - A DOM Element, Document, or jQuery to use as context.
    * @requires bootstrap.js
    */
    var initDropDown = function(context) {
        // adjust width of each dropdown to match content width
        $('.dropdown-default', context).each(function() {
            var btn = $(this).find('.dropdown-menu').siblings('.dropdown-toggle');
            var offset = 0;

            var padding = btn.actual('innerWidth') - btn.actual('width');
            var menuWidth = $(this).find('.dropdown-menu').actual('outerWidth');

            if (btn.actual('outerWidth') < menuWidth) {
                btn.width(menuWidth - offset);
                $(this).find('.dropdown-menu').width(btn.actual('outerWidth'));
            } else {
                $(this).find('.dropdown-menu').width(btn.actual('outerWidth'));
            }
        });
    }

    /** @function initFormGroupDefault
    * @description Initialize Pages form group input
    * @param {(Element|JQuery)} [context] - A DOM Element, Document, or jQuery to use as context.
    */
    var initFormGroupDefault = function(context) {
        $('.form-group.form-group-default', context).click(function() {
            $(this).find('input').focus();
        });
        $('body').on('focus', '.form-group.form-group-default :input', function() {
            $('.form-group.form-group-default').removeClass('focused');
            $(this).parents('.form-group').addClass('focused');
        });

        if (!this.initFormGroupDefaultRun) {
            $('body').on('focus', '.form-group.form-group-default :input', function() {
                $('.form-group.form-group-default').removeClass('focused');
                $(this).parents('.form-group').addClass('focused');
            });

            $('body').on('blur', '.form-group.form-group-default :input', function() {
                $(this).parents('.form-group').removeClass('focused');
                if ($(this).val()) {
                    $(this).closest('.form-group').find('label').addClass('fade');
                } else {
                    $(this).closest('.form-group').find('label').removeClass('fade');
                }
            });

            // Only run the above code once.
            this.initFormGroupDefaultRun = true;
        }

        $('.form-group.form-group-default .checkbox, .form-group.form-group-default .radio', context).hover(function() {
            $(this).parents('.form-group').addClass('focused');
        }, function() {
            $(this).parents('.form-group').removeClass('focused');
        });
    }

    /** @function initSlidingTabs
    * @description Initialize Bootstrap Custom Sliding Tabs
    * @param {(Element|JQuery)} [context] - A DOM Element, Document, or jQuery to use as context.
    * @requires bootstrap.js
    */
    var initSlidingTabs = function(context) {
        // TODO: move this to a separate file
        $('a[data-toggle="tab"]', context).on('show.bs.tab', function(e) {
            //e = $(e.relatedTarget || e.target).parent().find('a[data-toggle=tab]');
            e = $(e.target).parent().find('a[data-toggle=tab]');

            var hrefPrev = e.attr('href');

            var hrefCurrent = e.attr('href');

            if (!$(hrefCurrent).is('.slide-left, .slide-right')) return;
            $(hrefCurrent).addClass('sliding');

            setTimeout(function() {
                $(hrefCurrent).removeClass('sliding');
            }, 100);
        });
    }
    /** @function reponsiveTabs
    * @description Responsive handlers for Bootstrap Tabs
    */
    var reponsiveTabs = function() {
        //Dropdown FX
         $('[data-init-reponsive-tabs="dropdownfx"]').each(function() {
            var drop = $(this);
            drop.addClass("hidden-sm hidden-xs");
            var content = '<select class="cs-select cs-skin-slide full-width" data-init-plugin="cs-select">'
            for(var i = 1; i <= drop.children("li").length; i++){
                var li = drop.children("li:nth-child("+i+")");
                var selected ="";
                if(li.hasClass("active")){
                    selected="selected";
                }
                content +='<option value="'+ li.children('a').attr('href')+'" '+selected+'>';
                content += li.children('a').text();
                content += '</option>';
            }
            content +='</select>'
            drop.after(content);
            var select = drop.next()[0];
            $(select).on('change', function (e) {
                var optionSelected = $("option:selected", this);
                var valueSelected = this.value;
                drop.find('a[href="'+valueSelected+'"]').tab('show')
            })
            $(select).wrap('<div class="nav-tab-dropdown cs-wrapper full-width p-t-10 visible-xs visible-sm"></div>');
            new pg.Select(select);
         });

        //Tab to Accordian
        $.fn.tabCollapse && $('[data-init-reponsive-tabs="collapse"]').tabCollapse();
    }

    /** @function initNotificationCenter
    * @description Initialize Pages Header Notifcation Dropdown
    */
    var initNotificationCenter = function() {
        $('body').on('click', '.notification-list .dropdown-menu', function(event) {
            event.stopPropagation();
        });
        $('body').on('click', '.toggle-more-details', function(event) {
            var p = $(this).closest('.heading');
            p.closest('.heading').children('.more-details').stop().slideToggle('fast', function() {
                p.toggleClass('open');
            });
        });
    }

    /** @function initProgressBars
    * @description Initialize Pages ProgressBars
    */
    var initProgressBars = function() {
        $(window).on('load', function() {
            // Hack: FF doesn't play SVG animations set as background-image
            $('.progress-bar-indeterminate, .progress-circle-indeterminate, .mapplic-pin').hide().show(0);
        });
    }

    /** @function initInputFile
    * @description Initialize File Input for Bootstrap Buttons and Input groups
    */
    var initInputFile = function() {
        $(document).on('change', '.btn-file :file', function() {
            var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            input.trigger('fileselect', [numFiles, label]);
        });

        $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
            var input = $(this).parents('.input-group').find(':text'),
                log = numFiles > 1 ? numFiles + ' files selected' : label;
            if( input.length ) {
                input.val(log);
            } else {
                $(this).parent().html(log);
            }
        });
    }
    /** @function initHorizontalMenu
    * @description Initialize Horizontal Dropdown Menu
    */
    var initHorizontalMenu = function(){
        $(document).on('click', '.horizontal-menu .bar-inner > ul > li', function(){
            $(this).toggleClass('open').siblings().removeClass('open');
        });

        $('.content').on('click', function () {
            $('.horizontal-menu .bar-inner > ul > li').removeClass('open');
        });

        $('[data-pages="horizontal-menu-toggle"]').on('click touchstart', function(e) {
            e.preventDefault();
            $('body').toggleClass('menu-opened');
        });
    }
    /** @function initTooltipPlugin
    * @description Initialize Bootstrap tooltip
    * @param {(Element|JQuery)} [context] - A DOM Element, Document, or jQuery to use as context.
    * @requires bootstrap.js
    */
    var initTooltipPlugin = function(context) {
        $.fn.tooltip && $('[data-toggle="tooltip"]', context).tooltip();
    }
    /** @function initSelect2Plugin
    * @description Initialize select2 dropdown
    * @param {(Element|JQuery)} [context] - A DOM Element, Document, or jQuery to use as context.
    * @requires select2.js
    */
    var initSelect2Plugin = function(context) {
        $.fn.select2 && $('[data-init-plugin="select2"]', context).each(function() {
            $(this).select2({
                minimumResultsForSearch: ($(this).attr('data-disable-search') == 'true' ? -1 : 1)
            }).on('select2-opening', function() {
                $.fn.scrollbar && $('.select2-results').scrollbar({
                    ignoreMobile: false
                })
            });
        });
    }
    /** @function initScrollBarPlugin
    * @description Initialize Global Scroller
    * @param {(Element|JQuery)} [context] - A DOM Element, Document, or jQuery to use as context.
    * @requires jquery-scrollbar.js
    */
    var initScrollBarPlugin = function(context) {
        $.fn.scrollbar && $('.scrollable', context).scrollbar({
            ignoreOverlay: false
        });
    }
    /** @function initListView
    * @description Initialize iOS like List view plugin
    * @param {(Element|JQuery)} [context] - A DOM Element, Document, or jQuery to use as context.
    * @example <caption>data-init-list-view="ioslist"</caption>
    * @requires jquery-ioslist.js
    */
    var initListView = function(context) {
        $.fn.ioslist && $('[data-init-list-view="ioslist"]', context).ioslist();
        $.fn.scrollbar && $('.list-view-wrapper', context).scrollbar({
            ignoreOverlay: false
        });
    }

    /** @function initSwitcheryPlugin
    * @description Initialize iOS like List view plugin
    * @param {(Element|JQuery)} [context] - A DOM Element, Document, or jQuery to use as context.
    * @example <caption>data-init-plugin="switchery"</caption>
    * @requires Switchery.js
    */
    var initSwitcheryPlugin = function(context) {
        // Switchery - ios7 switch
        window.Switchery && $('[data-init-plugin="switchery"]', context).each(function() {
            var el = $(this);
            new Switchery(el.get(0), {
                color: (el.data("color") != null ?  pg.getColor(el.data("color")) : pg.getColor('success')),
                size : (el.data("size") != null ?  el.data("size") : "default")
            });
        });
    }

    /** @function initSelectFxPlugin
    * @description Initialize iOS like List view plugin
    * @param {(Element|JQuery)} [context] - A DOM Element, Document, or jQuery to use as context.
    * @example <caption>select[data-init-plugin="cs-select"]</caption>
    */
    var initSelectFxPlugin = function(context) {
        $('select[data-init-plugin="cs-select"]', context).each(function() {
            var el = $(this).get(0);
            $(el).wrap('<div class="cs-wrapper"></div>');
            new pg.Select(el);
        });
    }
    /** @function initUnveilPlugin
    * @description To load retina images to img tag
    * @param {(Element|JQuery)} [context] - A DOM Element, Document, or jQuery to use as context.
    */
    var initUnveilPlugin = function(context) {
        // lazy load retina images
        $.fn.unveil && $("img", context).unveil();
    }

    /** @function initValidatorPlugin
    * @description Inintialize and Overide exsisting jquery-validate methods.
    * @requires jquery-validate.js
    */
    var initValidatorPlugin = function() {
        /**
         * Open the socket.
         * @override
         */
        $.validator && $.validator.setDefaults({
            ignore: "", // validate hidden fields, required for cs-select
            showErrors: function(errorMap, errorList) {
                var $this = this;
                $.each(this.successList, function(index, value) {
                    var parent = $(this).closest('.form-group-attached');
                    if (parent.length) return $(value).popover("hide");
                });
                return $.each(errorList, function(index, value) {

                    var parent = $(value.element).closest('.form-group-attached');
                    if (!parent.length) {
                        return $this.defaultShowErrors();
                    }
                    var _popover;
                    _popover = $(value.element).popover({
                        trigger: "manual",
                        placement: "top",
                        html: true,
                        container: parent.closest('form'),
                        content: value.message
                    });
                    _popover.data("bs.popover").options.content = value.message;
                    var parent = $(value.element).closest('.form-group');
                    parent.addClass('has-error');
                    $(value.element).popover("show");
                });
            },
            onfocusout: function(element) {
                var parent = $(element).closest('.form-group');
                if ($(element).valid()) {
                    parent.removeClass('has-error');
                    parent.next('.error').remove();
                }
            },
            onkeyup: function(element) {
                var parent = $(element).closest('.form-group');
                if ($(element).valid()) {
                    $(element).removeClass('error');
                    parent.removeClass('has-error');
                    parent.next('label.error').remove();
                    parent.find('label.error').remove();
                } else {
                    parent.addClass('has-error');
                }
            },
            errorPlacement: function(error, element) {
                var parent = $(element).closest('.form-group');
                if (parent.hasClass('form-group-default')) {
                    parent.addClass('has-error');
                    error.insertAfter(parent);
                } else {
                    error.insertAfter(element);
                }
            }
        });
    }


    // init layout
    initDropDown();
    initFormGroupDefault();
    initSlidingTabs();
    initNotificationCenter();
    initProgressBars();
    initHorizontalMenu();
    // init plugins
    initTooltipPlugin();
    initSelect2Plugin();
    initScrollBarPlugin();
    initSwitcheryPlugin();
    initSelectFxPlugin();
    initUnveilPlugin();
    initValidatorPlugin();
    initListView();
    initInputFile();
    reponsiveTabs();