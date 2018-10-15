// v4.0
var Progress = function(element, options) {
    this.element = pg.queryElement(element);
    var color = this.element.getAttribute('data-color') || null;
    var thick = this.element.getAttribute('data-thick') || false
    this.defaults = {
        value: 0,
        color : color,
        thick : thick
    }
    this.options = pg.extend(this.defaults,options);
    var self = this;
    // start adding to to DOM
    this.container = document.createElement('div');
    this.container.className = "progress-circle";

    this.options.color &&  pg.addClass(this.container,this.options.color);
    this.options.thick && pg.addClass(this.container,"progress-circle-thick");

    var pie = document.createElement('div');
    pie.className = "pie";

    var pleft = document.createElement('div');
    pleft.className = "left-side half-circle";

    var pRight = document.createElement('div');
    pRight.className = "right-side half-circle";

    var shadow = document.createElement('div');
    shadow.className = "shadow";

    pie.appendChild(pleft);
    pie.appendChild(pRight);

    this.container.appendChild(pie);
    this.container.appendChild(shadow);

    this.element.parentNode.insertBefore(this.container, this.element.nextSibling);
    // end DOM adding

    this.val = this.element.value;
    var deg = this.perc2deg(this.val);

    if (this.val <= 50) {
      pleft.style.transform = 'rotate(' + deg + 'deg)'
    } else {
      pie.style.clip = 'rect(auto, auto, auto, auto)';
      pRight.style.transform = 'rotate(180deg)';
      pleft.style.transform = 'rotate(' + deg + 'deg)';
    }
    this.bindEvents();
    element[this.stringProgress] = this;

    //Public Functions 
    this.setValue = function(val) {
      self._setValue(val)
    }
}
//Private Functions
Progress.prototype ={
    perc2deg : function(p) {
        return parseInt(p / 100 * 360);
    },
    _setValue : function(e){
      var val = this.value;
      if (typeof val == 'undefined') return;

      var deg = perc2deg(val);

      if (val <= 50) {
          pleft.style.transform = 'rotate(' + deg + 'deg)'
      } else {
        pie.style.clip = 'rect(auto, auto, auto, auto)';
        pRight.style.transform = 'rotate(180deg)';
        pleft.style.transform = 'rotate(' + deg + 'deg)';
      }
    },
    bindEvents:function(){
      if ( !(this.stringProgress in this.element ) ) { // prevent adding event handlers twice
         pg.on(this.element, 'input', this._setValue);
      }
    }
}

pg.initializeDataAPI(stringProgress, Progress, doc[querySelectorAll]('[data-pages-progress="circle"]') );