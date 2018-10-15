var Card = function(element, options) {
    this.element = pg.queryElement(element);
    this.defaults = {
        progress: 'circle',
        progressColor: 'master',
        refresh: false,
        error: null,
        overlayColor: '255,255,255',
        overlayOpacity: 0.8,
        refreshButton: '[data-toggle="refresh"]',
        maximizeButton: '[data-toggle="maximize"]',
        collapseButton: '[data-toggle="collapse"]',
        closeButton: '[data-toggle="close"]'
    }
    this.options = pg.extend(this.defaults,options);
    this.loader = null;
    this.body = this.element.querySelector('.card-body');
    this.bindEvents();
}
// Button actions
Card.prototype = {
    bindEvents: function(){
        var self = this;
        
        var btnCollapse = this.element.querySelector(this.options.collapseButton);
        var btnClose = this.element.querySelector(this.options.closeButton);
        var btnRefresh = this.element.querySelector(this.options.refreshButton);
        var btnMaximize = this.element.querySelector(this.options.maximizeButton);

        if(btnCollapse){
            pg.on(btnCollapse,'click', function(e) {
                if(e.currentTarget.nodeName === 'A') e.preventDefault();
                self.collapse();
            });
        } 

        if(btnClose){
            pg.on(btnClose,'click', function(e) {
                if(e.currentTarget.nodeName === 'A') e.preventDefault();
                self.close();
            });
        } 

        if(btnRefresh){
            pg.on(btnRefresh,'click', function(e) {
                if(e.currentTarget.nodeName === 'A') e.preventDefault();
                self.refresh(true);
            });
        } 

        if(btnMaximize){
            pg.on(btnMaximize,'click', function(e) {
                if(e.currentTarget.nodeName === 'A') e.preventDefault();
                self.maximize();
            });
        } 
    
    },
    collapse:function() {
      var icon = this.element.querySelector(this.options.collapseButton + ' > i');
      var heading = this.element.querySelector('.card-header');

      if (pg.hasClass(this.element,'card-collapsed')) {
         Velocity.animate(this.body, "slideDown", { 
            duration: 200,
            complete:function(){ } 
         });
          pg.removeClass(this.element,'card-collapsed');
          if(icon){
            icon.className = "";
            pg.addClass(icon,'pg-arrow_maximize')
          }

          if(this.options.onExpand) this.options.onExpand(this);
          return
      } else {
        Velocity.animate(this.body, "slideUp", { 
            duration: 200,
            complete:function(){ } 
         });
      }
      pg.addClass(this.element,'card-collapsed');
      if(icon){
          icon.className = "";
          pg.addClass(icon,'pg-arrow_minimize')
      }
      if(this.options.onCollapse) this.options.onCollapse(this);
  },

  close:function() {
      this.element.parentNode.removeChild(this.element)
      if(this.options.onClose) this.options.onClose(this);
  },

  maximize:function() {
      var icon = this.element.querySelector(this.options.maximizeButton + ' > i');

      if (pg.hasClass(this.element,'card-maximized')) {
          pg.removeClass(this.element,'card-maximized');
          this.element.removeAttribute('style');
          if(icon){
            pg.removeClass(icon,"pg-fullscreen_restore");
            pg.addClass(icon,'pg-arrow_maximize')
          }
          if(this.options.onRestore) this.options.onRestore(this);
      } else {
          var sidebar = document.querySelector('[data-pages="sidebar"]');
          var header = document.querySelector('.header');
          var sidebarWidth = 0;
          var headerHeight = 0;
          if(sidebar){
            var rect = window.getComputedStyle(sidebar, null);
            sidebarWidth = rect.left + rect.width;
          }
          if(header){
            var rect = window.getComputedStyle(header, null);
            headerHeight = rect.height;
          }

          pg.addClass(this.element,'card-maximized');
          this.element.style.left = sidebarWidth
          this.element.style.top = headerHeight;

          if(icon){
            pg.removeClass(icon,"pg-fullscreen");
            pg.addClass(icon,'pg-fullscreen_restore');
          }
          if(this.options.onMaximize) this.options.onMaximize(this);
      }
  },

  // Options
  refresh:function(refresh) {
      var toggle = this.element.querySelector(this.options.refreshButton);

      if (refresh) {
          if (this.loader && pg.isVisible(this.loader)) return;
          if (!this.options.onRefresh) return; // onRefresh() not set
          this.loader = document.createElement('div');
          this.loader.style.backgroundColor = 'rgba(' + this.options.overlayColor + ',' + this.options.overlayOpacity + ')'

          var elem = document.createElement('div');

          if (this.options.progress == 'circle') {
              elem.className = "progress progress-small progress-circle-"+ this.options.progressColor;
          } else if (this.options.progress == 'bar') {
              elem.className = "progress progress-small";
              var child = document.createElement("div");
              child.className = "progress-bar-indeterminate progress-bar-"+ this.options.progressColor;
              elem.appendChild(child);
          } else if (this.options.progress == 'circle-lg') {
              pg.addClass(toggle,'refreshing');
              var iconOld = toggle.querySelector('> i');
              var iconNew;
              if (!toggle.find('[class$="-animated"]').length) {
                  iconNew = document.createElement("i");
                  iconNew.style.position = "absolute";
                  iconNew.style.top = "absolute";
                  iconNew.style.left = "absolute";

                  var rect = window.getComputedStyle(iconOld, null);
                  iconNew.css({
                      'position': 'absolute',
                      'top': rect.top+"px",
                      'left': rect.left+"px"
                  });
                  pg.addClass(iconNew,'card-icon-refresh-lg-' + this.options.progressColor + '-animated');
                  toggle.appendChild(iconNew);
              } else {
                  iconNew = toggle.querySelector('[class$="-animated"]');
              }

              pg.addClass(iconOld,'fade');
              pg.addClass(iconNew,'active');


          } else {
              elem.className = "progress progress-small";
              var child = document.createElement("div");
              child.className = "progress-bar-indeterminate progress-bar-" + this.options.progressColor;
              elem.appendChild(child);
          }

          this.loader.appendChild(elem);
          this.element.appendChild(this.loader);

          // Start Fix for FF: pre-loading animated to SVGs
          var _loader = this.loader;
          setTimeout(function() {
              this.loader.parentNode.removeChild(this.loader)
              this.element.appendChild(_loader);
          }.bind(this), 300);
          // End fix

          Velocity.animate(this.loader, "fadeIn", { 
            duration: 200,
            complete:function(){      
            } 
          });

          if(this.options.onRefresh) this.options.onRefresh(this);

      } else {

            
          var _this = this;
          Velocity.animate(this.loader, "fadeOut", { 
            duration: 200,
            complete:function(){      
                _this.loader.remove();
                if (_this.options.progress == 'circle-lg') {
                    var iconNew = toggle.querySelector('.active');
                    var iconOld = toggle.querySelector('.fade');
                    pg.removeClass(iconNew, 'active');
                    pg.removeClass(iconOld, 'fade');
                    pg.removeClass(toggle, 'refreshing');
                }
                _this.options.refresh = false;
            } 
          });
      }
  },

  error:function(error) {
      if (error) {
          var _this = this;

          //TODO
          // this.$element.pgNotification({
          //     style: 'bar',
          //     message: error,
          //     position: 'top',
          //     timeout: 0,
          //     type: 'danger',
          //     onShown: function() {
          //         _this.$loader.find('> div').fadeOut()
          //     },
          //     onClosed: function() {
          //         _this.refresh(false)
          //     }
          // }).show();
      }
  }
}
