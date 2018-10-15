// ALERT DEFINITION
  // ================
  var SideBar = function( element, options ) {
    
    // initialization element
    element = pg.queryElement(element);
    this.body =  document.body
    this.cssAnimation = true;
    this.css3d = true;
    this.sideBarWidth = 280;
    this.sideBarWidthCondensed = 280 - 70;
    this.defaults = {
        pageContainer :".page-container"
    }
    var sidebarMenu = element.querySelectorAll('.sidebar-menu > ul'),
    pageContainer = document.querySelectorAll(this.defaults.pageContainer),
    stringSideBar = "SideBar";

    var self = this,
    openSideBar = function(e){
        var _sideBarWidthCondensed = pg.hasClass(body,"rtl") ? - self.sideBarWidthCondensed : self.sideBarWidthCondensed;

         var menuOpenCSS = (this.css3d == true ? 'translate3d(' + _sideBarWidthCondensed + 'px, 0,0)' : 'translate(' + _sideBarWidthCondensed + 'px, 0)');

         if (pg.isVisibleSm() || pg.isVisibleXs()) {
             return false
         }
         // @TODO : 
         // if ($('.close-sidebar').data('clicked')) {
         //     return;
         // }
         if (pg.hasClass(self.body,"menu-pin"))
             return;

         element.style.transform = menuOpenCSS
         pg.addClass(body,'sidebar-visible');
         
    },

    closeSideBar = function(e) {
        var menuClosedCSS = (self.css3d == true ? 'translate3d(0, 0,0)' : 'translate(0, 0)');

         if (pg.isVisibleSm() || pg.isVisibleXs()) {
             return false
         }
         // @TODO : 
         // if (typeof e != 'undefined') {
         //     if (document.querySelectorAll('.page-sidebar').length) {
         //         return;
         //     }
         // }
         if (pg.hasClass(self.body,"menu-pin"))
             return;

         if (pg.hasClass(element.querySelector('.sidebar-overlay-slide'),'show')) {
            // @TODO : 
            pg.removeClass(element.querySelector('.sidebar-overlay-slide'),'show')
            // $("[data-pages-toggle']").removeClass('active')
         }
         element.style.transform = menuClosedCSS;
         pg.removeClass(self.body,'sidebar-visible');
    },
    
    toggleSidebar = function(toggle) {
         var timer;
         var bodyStyles = window.getComputedStyle ? getComputedStyle(body, null) : body.currentStyle;
         pageContainer[0].style.backgroundColor = bodyStyles.backgroundColor;

         if (pg.hasClass(body,'sidebar-open')) {
             pg.removeClass(body,'sidebar-open');
             timer = setTimeout(function() {
                 pg.removeClass(element,'visible');
             }.bind(this), 400);
         } else {
             clearTimeout(timer);
             pg.addClass(element,'visible');
             setTimeout(function() {
                 pg.addClass(body,'sidebar-open');
             }.bind(this), 10);
             setTimeout(function(){
                // remove background color
                pageContainer[0].style.backgroundColor = ''
             },1000);
         }
    },
    togglePinSidebar = function(toggle) {
         if (toggle == 'hide') {
             pg.removeClass(body,'menu-pin');
         } else if (toggle == 'show') {
             pg.addClass(body,'menu-pin');
         } else {
             pg.toggleClass(body,'menu-pin');
         }
    };
    // public method
    this.close = function() {
        self.closeSideBar();
    };
    this.open = function() {
        self.openSideBar();
    };
    this.menuPin = function(toggle){
        self.togglePinSidebar(toggle);
    };
    this.toggleMobileSidebar = function(toggle){

    };
    // init events 
    if ( !(this.stringSideBar in element ) ) { // prevent adding event handlers twice
      pg.on(element, "mouseenter", openSideBar);
      pg.on(pageContainer[0],'mouseover',closeSideBar)
      pg.live('.sidebar-menu a','click',function(e){
        var element = this
        if(element.parentNode.querySelectorAll(".sub-menu") === false){
            return
        }
        var parent = element.parentNode.parentNode
        var li = element.parentNode
        var sub = element.parentNode.querySelector(".sub-menu");
        if(pg.hasClass(li,"open")){
            pg.removeClass(element.querySelector(".arrow"),"open")
            pg.removeClass(element.querySelector(".arrow"),"active");
            //Velocity(sub, "stop", true);
            Velocity.animate(sub, "slideUp", { 
                duration: 200,
                complete:function(){
                    pg.removeClass(li,"open")
                    pg.removeClass(li,"active")
                } 
            });
        }
        else{
            var openMenu = parent.querySelector("li.open");
            if(openMenu){
                Velocity.animate(openMenu, "slideUp", { 
                    duration: 200,
                    complete:function(){
                        pg.removeClass(li,"open")
                        pg.removeClass(li,"active")
                        pg.removeClass(openMenu,"open");
                        pg.removeClass(openMenu,"active");
                    } 
                });
                pg.removeClass(openMenu.querySelector("li > a .arrow"),"open");
                pg.removeClass(openMenu.querySelector("li > a .arrow"),"active");
            }
            pg.addClass(element.querySelector(".arrow"),"open");
            pg.addClass(element.querySelector(".arrow"),"active");
            //Velocity(sub, "stop", true);
            Velocity.animate(sub, "slideDown", { 
                duration: 200,
                complete:function(){
                    pg.addClass(li,"open")
                    pg.addClass(li,"active")
                } 
            });                
        }
        });
    }
    pg.live('.sidebar-slide-toggle','click', function(e) {
         e.preventDefault();
         pg.toggleClass(this,'active');
         var el = this.getAttribute('data-pages-toggle');
         if (el != null) {
            //Only by ID
            el = document.getElementById(el.substr(1));
            pg.toggleClass(el,'show');
         }
    });
    element[this.stringSideBar] = this;
  };
  //TODO : Move to different Scope
  pg.initializeDataAPI(stringSideBar, SideBar, doc[querySelectorAll]('[data-pages="sidebar"]') );   