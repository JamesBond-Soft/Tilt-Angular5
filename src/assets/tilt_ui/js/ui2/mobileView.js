 //TODO : NEEDS vars than data-attributes
 var MobileView = function(element, options) {
    this.element = pg.queryElement(element);
    this.options = pg.extend(this.defaults,options);
    var self = this;

    if ( !(this.stringMobileView in element ) ) { // prevent adding event handlers twice
        pg.on(this.element,'click',function(e){
            var el = document.getElementById(this.getAttribute('data-view-port'));
            var toView = document.getElementById(this.getAttribute('data-toggle-view'));
            if (toView != null) {
                //el.children().last().children('.view').hide();
                toView.style.display = "block"
            }
            else{
                 toView = el.last();
            }
            pg.toggleClass(el,this.getAttribute('data-view-animation'));
            //self.options.onNavigate(toView, data.viewAnimation);
            return false;                
        })
    }
    element[this.stringSideBar] = this;
};

pg.initializeDataAPI(stringMobileView, MobileView, doc[querySelectorAll]('[data-navigate="view"]') );  