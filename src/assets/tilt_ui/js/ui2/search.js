// v4.0
// SEARCH CLASS DEFINITION
    // ======================

    
var Search = function(element, options) {
    this.element = pg.queryElement(element);
    this.defaults = {
      searchField: '[data-search="searchField"]',
      closeButton: '[data-search="closeButton"]',
      suggestions: '[data-search="suggestions"]',
      brand: '.overlay-brand'
    }
    this.options = pg.extend(this.defaults,options);
    this.init();
}
//Search.VERSION = "1.0.0";

Search.prototype = {
    init:function() {
      var _this = this;
      this.pressedKeys = [];
      this.ignoredKeys = [];

      //Cache elements
      this.searchField = this.element.querySelector(this.options.searchField);
      this.closeButton = this.element.querySelector(this.options.closeButton);
      this.suggestions = this.element.querySelector(this.options.suggestions);
      this.brand = this.element.querySelector(this.options.brand);

      pg.on(this.searchField,'keyup', function(e) {
          if(_this.suggestions){
            _this.suggestions.innerHTML = this.value;
          }
      });

      pg.on(this.searchField,'keyup', function(e) {
          _this.options.onKeyEnter && _this.options.onKeyEnter(_this.searchField.value);
          if (e.keyCode == 13) { //Enter pressed
              e.preventDefault();
              _this.options.onSearchSubmit && _this.options.onSearchSubmit(_this.searchField.value);
          }
          if (pg.hasClass(document.body,'overlay-disabled')) {
              return 0;
          }

      });

      pg.on(this.closeButton,'click', function() {
          _this.toggleOverlay('hide');
      });

      pg.on(this.element,'click', function(e) {
          if(e.target.getAttribute('data-pages') === 'search'){
              _this.toggleOverlay('hide');              
          }
      });

      pg.on(document, 'keypress', function(e) {
          _this.keypress(e);
      });

      pg.on(document, 'keyup', function(e) {
        // Dismiss overlay on ESC is pressed
        // .is(':visible') in vanilla JS
          if (pg.isVisible(_this.element) && e.keyCode == 27) {
              _this.toggleOverlay('hide');
          }
      });

      pg.live('[data-toggle="search"]', 'click', function(e){
          if(e.target.nodeName === 'A') e.preventDefault();
          _this.toggleOverlay('show');
      })

  },


  keypress:function(e) {

      e = e || event; // to deal with IE
      var nodeName = e.target.nodeName;
      if (pg.hasClass(document.body,'overlay-disabled') ||
          pg.hasClass(e.target,'js-input') ||
          nodeName == 'INPUT' ||
          nodeName == 'TEXTAREA') {
          return;
      }

      if (e.which !== 0 && e.charCode !== 0 && !e.ctrlKey && !e.metaKey && !e.altKey && e.keyCode != 27) {
          this.toggleOverlay('show', String.fromCharCode(e.keyCode | e.charCode));
      }
  },


  toggleOverlay:function(action, key) {
      var _this = this;
      if (action == 'show') {
          pg.removeClass(this.element,"hide");
          // TODO
          //this.$element.fadeIn("fast");
          if (document.activeElement !== this.searchField) {
              this.searchField.value = key;
              setTimeout(function() {
                  this.searchField.focus();
                  var tmpStr = this.searchField.value;
                  this.searchField.value = "";
                  this.searchField.value = tmpStr;
              }.bind(this), 10);
          }

          pg.removeClass(this.element,"hide");
          this.brand && pg.toggleClass(this.brand,'invisible');
          pg.off(document,'keypress',function(){})
      } else {
          var element = this.element;
          Velocity.animate(element, "fadeOut", { 
                duration: 200,
                complete:function(){
                    pg.addClass(element,"hide")
                    element.removeAttribute('style');                    
                } 
          });
          this.searchField.val = ""
          this.searchField.blur();
          setTimeout(function() {
              if (pg.isVisible(_this.element)) {
                  pg.toggleClass(_this.brand, 'invisible')
              }
              pg.on(document, 'keypress', function(e) {
                  _this.keypress(e);
              });
          }.bind(this), 10);
      }
  }
};