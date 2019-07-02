var promise = document.querySelector('video').play();

    if (promise !== undefined) {
        promise.catch(error => {
            // Auto-play was prevented
            // Show a UI element to let the user manually start playback
        }).then(() => {
            // Auto-play started
        });
    }

$(window).scroll(function() {
// 100 = The point you would like to fade the nav in.
  
	if ($(window).scrollTop() > 50 ){
    
 		$('.navbg').addClass('showbg');
    
  } else {
    
    $('.navbg').removeClass('showbg');
    
 	};   	
});

$('.scroll').on('click', function(e){		
		e.preventDefault()
    
  $('html, body').animate({
      scrollTop : $(this.hash).offset().top
    }, 1500);
});

$("#navbarsDefault ul li a[href^='#']").on('click', function(e) {

   // prevent default anchor click behavior
   e.preventDefault();

   // store hash
   var hash = this.hash;

   // animate
   $('html, body').animate({
       scrollTop: $(hash).offset().top
     }, 1500, function(){

       // when done, add hash to url
       // (default click behaviour)
       window.location.hash = hash;
     });

});


jQuery(document).ready(function($) {
        		"use strict";
        		//  TESTIMONIALS CAROUSEL HOOK
		        $('#customers-testimonials').owlCarousel({
		            loop: true,
		            center: true,
		            items: 3,
		            margin: 0,
		            autoplay: true,
		            dots:true,
		            autoplayTimeout: 8500,
		            smartSpeed: 450,
		            responsive: {
		              0: {
		                items: 1
		              },
		              768: {
		                items: 2
		              },
		              1170: {
		                items: 3
		              }
		            }
		        });

		        $('#customers-vtestimonials').owlCarousel({
		            loop: true,
		            center: true,
		            items: 3,
		            margin: 0,
		            autoplay: true,
		            dots:true,
		            autoplayTimeout: 8500,
		            smartSpeed: 450,
		            responsive: {
		              0: {
		                items: 1
		              },
		              768: {
		                items: 2
		              },
		              1170: {
		                items: 3
		              }
		            }
		        });

		        $("#gallery-slider").owlCarousel({
		            margin: 20,
			        loop: true,
			        nav:true, 
			        dots: false,
			        navText:  [
		            "<i class='fa fa-angle-left'></i>",
		            "<i class='fa fa-angle-right'></i>"],  
			        responsive: {
			          0: {
			            items: 1
			          },
			          768: {
			            items: 3
			          },
			          1200: {
			            items: 4
			          }
			        }
		        });

        	});