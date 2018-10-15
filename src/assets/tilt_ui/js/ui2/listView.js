var ListView = function(elem, options) {
    this.elem = pg.queryElement(elem);
    this.elem[this.stringListView] = this;
    this.init(options);
};

ListView.prototype = {
    defaults: {
        classes: {
            animated: "list-view-animated",
            container: "list-view-wrapper",
            hidden: "list-view-hidden",
            stationaryHeader: "list-view-fake-header"
        },
        selectors: {
            groupContainer: ".list-view-group-container",
            groupHeader: ".list-view-group-header",
            stationaryHeader: "h2"
        }
    },

    init: function(options) {
        var scope = this,
            isIOS = navigator.userAgent.match(/ipad|iphone|ipod/gi) ? true : false;

        //set defaults
        this.options = pg.extend(this.defaults,options);
        this.elems = [];
        //indicate that this is an ioslist
        pg.addClass(this.elem,'ioslist');
        //wrap all the children
        var wrapper = document.createElement('div');
        wrapper.className = this.options.classes.container;
        wrapper.setAttribute("data-ios",isIOS);

        pg.wrapAll(this.elem.childNodes,wrapper)

        var newEl = document.createElement(this.options.selectors.stationaryHeader);
        this.elem.insertBefore(newEl,this.elem.childNodes[0]);

        this.listWrapper = this.elem.querySelector('.' + this.options.classes.container);
        this.fakeHeader = this.elem.querySelector(this.options.selectors.stationaryHeader);
        pg.addClass(this.fakeHeader,this.options.classes.stationaryHeader);

        this.refreshElements();

        this.fakeHeader.innerHTML = this.elems[0].headerText;
        if ( !("ListView" in this.elem ) ) { // prevent adding event handlers twice
          if(this.listWrapper.addEventListener)
            this.listWrapper.addEventListener('scroll', function(){
              scope.testPosition()
            }, false);   
          else if (this.listWrapper.attachEvent)
            this.listWrapper.attachEvent('onscroll', function(){
              scope.testPosition()  
            }); 
        }

    },

    refreshElements: function() {
        var scope = this;
        this.elems = [];
        var groupContainers = this.elem.querySelectorAll(this.options.selectors.groupContainer);
        [].forEach.call(groupContainers, function(el) {
            var tmp_header = el.querySelector(scope.options.selectors.groupHeader),
                tmp_wrapper_rect = scope.listWrapper.getBoundingClientRect(),
                tmp_rect  = el.getBoundingClientRect(),
                tmp_styles = window.getComputedStyle(tmp_header, null);

            scope.elems.push({
                'list': el,
                'header': tmp_header,
                'listHeight': tmp_rect.height,
                'headerText': tmp_header.innerHTML,
                'headerHeight': tmp_header.getBoundingClientRect().height + parseFloat(tmp_styles.marginTop) + parseFloat(tmp_styles.marginBottom),
                'listOffset': tmp_rect.top - tmp_wrapper_rect.top,
                'listBottom': tmp_rect.height + (tmp_rect.top - tmp_wrapper_rect.top)
            });
        });
    },

    testPosition: function() {
        var currentTop = this.listWrapper.scrollTop,
            topElement, offscreenElement, topElementBottom, i = 0;

        while ((this.elems[i].listOffset - currentTop) <= 0) {
            topElement = this.elems[i];
            topElementBottom = topElement.listBottom - currentTop;
            if (topElementBottom < -topElement.headerHeight) {
                offscreenElement = topElement;
            }
            i++;
            if (i >= this.elems.length) {
                break;
            }
        }

        if (topElementBottom < 0 && topElementBottom > -topElement.headerHeight) {
            pg.addClass(this.fakeHeader,this.options.classes.hidden);
            pg.addClass(topElement.list,this.options.classes.animated)
        } else {
            pg.removeClass(this.fakeHeader,this.options.classes.hidden);
            if (topElement) {
                pg.removeClass(topElement.list,this.options.classes.animated);
            }
        }

        if (topElement) {
            this.fakeHeader.innerHTML = topElement.headerText;
        }
    }
};
pg.initializeDataAPI(stringListView, ListView, doc[querySelectorAll]('[data-pages="list-view"]') );