if (typeof define === 'function' && define.amd) {
    // AMD support:
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like:
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    var pg = factory();
    root.pg.SideBar = pg.SideBar;
    root.pg.Parallax = pg.Parallax;
    root.pg.Progress = pg.Progress;
    root.pg.MobileView = pg.MobileView;
    root.pg.Search = pg.Search;
    root.pg.Card = pg.Card;
    root.pg.Quickview = pg.Quickview;

    root.Velocity = root.Velocity || $.Velocity;
  }