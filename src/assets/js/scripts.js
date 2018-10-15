(function($) {

    'use strict';

    // $(document).ready(function() {
    //     // Initializes search overlay plugin.
    //     // Replace onSearchSubmit() and onKeyEnter() with 
    //     // your logic to perform a search and display results
    //     //$(".list-view-wrapper").scrollbar();
    //     $(".menu-items a").click(function (e) {
    //         if ($(this).attr("href") == '#') {
    //             console.log('found');
    //             e.preventDefault();
    //             $(this).closest('li').children('ul').slideToggle( "fast", function() {
    //                 // Animation complete.
    //             });
    //         }
    //     });

    // });

    
    $('.panel-collapse label').on('click', function(e){
        e.stopPropagation();
    });

    //https://github.com/colebemis/feather
    //Feather ICONS
    //Used in sidebar icons 
    
    feather.replace({
        'width':16, 
        'height':16 
    })
    
})(window.jQuery);