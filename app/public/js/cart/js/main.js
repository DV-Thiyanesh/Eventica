$(function(){
	$("#wizard").steps({
        headerTag: "h4",
        bodyTag: "section",
        transitionEffect: "fade",
        enableAllSteps: true,
        transitionEffectSpeed: 300,
        labels: {
            next: "Continue",
            previous: "Back",
            finish: 'Proceed to checkout'
        },
        onStepChanging: function (event, currentIndex, newIndex) { 
            if ( newIndex >= 1 ) {
                $('.steps ul li:first-child a img').attr('src','./images/step-3.png');
            } else {
                $('.steps ul li:first-child a img').attr('src','./images/step-3-active.png');
            }

            if ( newIndex === 1 ) {
                $('.steps ul li:nth-child(2) a img').attr('src','./images/step-4-active.png');
            } else {
                $('.steps ul li:nth-child(2) a img').attr('src','./images/step-4.png');
            }

         
            return true; 
        }
    });
    // Custom Button Jquery Steps
    $('.forward').click(function(){
    	$("#wizard").steps('next');
    })
    $('.backward').click(function(){
        $("#wizard").steps('previous');
    })
     
    // Create Steps Image
    $('.steps ul li:first-child').append('<img src="./images/step-arrow.png" alt="" class="step-arrow">').find('a').append('<img src="./images/step-3-active.png" alt=""> ').append('<span class="step-order">Step 01</span>');
    $('.steps ul li:nth-child(2').append('<img src="./images/step-arrow.png" alt="" class="step-arrow">').find('a').append('<img src="./images/step-4.png" alt="">').append('<span class="step-order">Step 02</span>');
    // $('.steps ul li:nth-child(3)').append('<img src="images/step-arrow.png" alt="" class="step-arrow">').find('a').append('<img src="images/step-3.png" alt="">').append('<span class="step-order">Step 03</span>');
    // $('.steps ul li:last-child a').append('<img src="images/step-4.png" alt="">').append('<span class="step-order">Step 04</span>');
    //  Count input 
    $(".quantity span").on("click", function() {

        var $button = $(this);
        var oldValue = $button.parent().find("input").val();

        if ($button.hasClass('plus')) {
          var newVal = parseFloat(oldValue) + 1;
        } else {
           // Don't allow decrementing below zero
          if (oldValue > 0) {
            var newVal = parseFloat(oldValue) - 1;
            } else {
            newVal = 0;
          }
        }
        $button.parent().find("input").val(newVal);
    });
})
