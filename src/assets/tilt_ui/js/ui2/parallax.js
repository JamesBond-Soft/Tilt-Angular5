var Parallax = function(element, options) {
    element = pg.queryElement(element);
    this.element = element;
    this.defaults = {
        speed: {
            coverPhoto: 0.3,
            content: 0.17
        },
        scrollElement: window
    }
    this.options = pg.extend(this.defaults,options)
    this.coverPhoto = element.querySelector('.cover-photo');
    // TODO: rename .inner to .page-cover-content
    this.content = element.querySelector('.inner');

    // if cover photo img is found make it a background-image
    if (this.coverPhoto) {
        var img = this.coverPhoto.querySelector('> img');
        this.coverPhoto.style.backgroundImage = 'url(' + img.getAttribute('src') + ')';
        img.parentNode.removeChild(img);
    }
    // init events 
    if ( !(this.stringParallax in element ) ) { // prevent adding event handlers twice
        if(!pg.isTouchDevice()){
            pg.on(window,scroll,this.animate())
        }
    }
    element[this.stringParallax] = this;
}
Parallax.prototype.animate = function() {

    var scrollPos;
    var pagecoverWidth = this.element.height;
    //opactiy to text starts at 50% scroll length
    var opacityKeyFrame = pagecoverWidth * 50 / 100;
    var direction = 'translateX';

    if (this.options.scrollElement == window){
        scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    }
    else{
        scrollPos =  document.querySelector(this.options.scrollElement).scrollTop;
    }
    
    direction = 'translateY';
    var styleString = direction + '(' + scrollPos * this.options.speed.coverPhoto + 'px)';
    if (this.coverPhoto) {
        this.coverPhoto.style.transform = styleString
        //Legacy Browsers
        this.coverPhoto.style.webkitTransform = styleString
        this.coverPhoto.style.mozTransform = styleString
        this.coverPhoto.style.msTransform = styleString
    }

    this.content.style.transform = styleString
    //Legacy Browsers
    this.content.style.webkitTransform = styleString
    this.content.style.mozTransform = styleString
    this.content.style.msTransform = styleString

    if (scrollPos > opacityKeyFrame) {
        this.content.style.opacity =  1 - scrollPos / 1200;
    } else {
        this.content.style.opacity = 1;
    }

}

pg.initializeDataAPI(stringParallax, Parallax, doc[querySelectorAll]('[data-pages="parallax"]') );  