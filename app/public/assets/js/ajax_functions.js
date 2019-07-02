 $(document).ready(function() {
	$("#form_sign_up").submit(function(event) {
        event.preventDefault();
        //var formData = new FormData( this );
        var ajax_url = '';
        
		ajax_url = '/signup_ajax';
        var form_id    = '#form_sign_up';
		
		var firstname 		= $.trim($(form_id+" #user_first_name").val());
		var lastname 		= $.trim($(form_id+" #user_last_name").val());
		var email 			= $.trim($(form_id+" #user_email").val());
		var user_password 	= $.trim($(form_id+" #user_password").val());
		var user_cpassword	= $.trim($(form_id+" #user_cpassword").val());
		var referred_by		= $.trim($(form_id+" #referred_by").val());
		var gcaptcha 		= $(form_id+" .g-recaptcha-response").val();
		
		if($(form_id+" #user_join_check").prop('checked') == false){
		    $.bootstrapGrowl('Please select Join Lynked.World Telegram Channel', {type: 'danger', delay: 500,width:450});
			return false;
		}
		if($(form_id+" #user_term_check").prop('checked') == false){
		    $.bootstrapGrowl('Please select Terms and Privacy', {type: 'danger', delay: 500,width:450});
			return false;
		}
		if(firstname==''){
			$.bootstrapGrowl('Firstname is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(firstname.length>40){
			$.bootstrapGrowl('Firstname required maximum 40 characters', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(!sanitize(firstname)){
			$.bootstrapGrowl('Firstname allow alpha-numeric characters', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(lastname==''){
			$.bootstrapGrowl('Lastname is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(lastname.length>40){
			$.bootstrapGrowl('Lastname required maximum 40 characters', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(!sanitize(lastname)){
			$.bootstrapGrowl('Lastname allow alpha-numeric characters', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(email==''){
			$.bootstrapGrowl('Email is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(!isEmail(email)){
			$.bootstrapGrowl('Please enter valid email', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(user_password==''){
			$.bootstrapGrowl('Password is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(user_password.length<8){
            $.bootstrapGrowl('Password required minimum 8 characters', {type: 'danger', delay: 500,width:350});
            return false;
		}
		if(user_password.length>15){
            $.bootstrapGrowl('Password allow maximum 15 characters', {type: 'danger', delay: 500,width:350});
            return false;
		}
		if(!passwordCheck(user_password)){
			$.bootstrapGrowl('Password allow alpha-numeric and pre-defined special characters. (_@.#-)', {type: 'danger', delay:700,width:500});
			return false;
		}
		if(user_cpassword==''){
			$.bootstrapGrowl('Confirm Password is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(user_password!=user_cpassword){
			$.bootstrapGrowl('Password and Confirm Password does not match.', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(gcaptcha==''){
			$.bootstrapGrowl('Please verify captcha', {type: 'danger', delay: 500,width:350});
			grecaptcha.reset();
			return false;
		}

		var formData = {
			email:email,
			password:user_password,
			repeatpassword:user_cpassword,
			firstname:firstname,
			referred_by:referred_by,
			lastname:lastname
		};

		$.ajax({
			url: ajax_url,
			type: "POST",
			dataType: 'json',
    		data: formData,
			cache : false,
			success: function (result) {
				if(result.status=='OK'){
					$.bootstrapGrowl('Thank You for registration', {type: 'success', delay: 700,width:350});
					setTimeout(function() { window.location.href="/userorders"; },900);
				}else{
					$.bootstrapGrowl(result.msg, {type: 'danger', delay: 700,width:350});
				}
			},
			error: function (err) {
			 console.log(err);
			 $.bootstrapGrowl('Invalid request', {type: 'danger', delay: 700,width:350});
			}
		});
    });

    //forgor password
    $("#signin-forgot").submit(function(event) {
        event.preventDefault();

        var ajax_url 		= '';
		ajax_url 			= '/forgot_ajax';
        var form_id    		= '#signin-forgot';
		var email 			= $.trim($(form_id+" #forgot_email").val());
		
		if(email==''){
			$.bootstrapGrowl('Email is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(!isEmail(email)){
			$.bootstrapGrowl('Please enter valid email', {type: 'danger', delay: 500,width:350});
			return false;
		}
		
		var formData = {email:email};
		
		$.ajax({
			url: ajax_url,
			type: "POST",
			dataType: 'json',
    		data: formData,
			cache : false,
			success: function (result) {
				if(result.status=='OK'){
					$.bootstrapGrowl(result.msg, {type: 'success', delay: 700,width:500});
					setTimeout(function() { location.reload(); },900);
				}else{
					$.bootstrapGrowl(result.msg, {type: 'danger', delay: 700,width:350});
				}
			},
			error: function (err) {
			 console.log(err);
			 $.bootstrapGrowl('Invalid request', {type: 'danger', delay: 700,width:350});
			}
		});
    });

    //sign-In
    $("#form_signin").submit(function(event) {
        event.preventDefault();

        var ajax_url 		= '';
		ajax_url 			= '/login';
        var form_id    		= '#form_signin';
		var email 			= $.trim($(form_id+" #email").val());
		var user_password 	= $.trim($(form_id+" #password").val());
		var gcaptcha 		= $(form_id+" .g-recaptcha-response").val();
		
		if(email==''){
			$.bootstrapGrowl('Email is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(!isEmail(email)){
			$.bootstrapGrowl('Please enter valid email', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(user_password==''){
			$.bootstrapGrowl('Password is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(gcaptcha==''){
			$.bootstrapGrowl('Please verify captcha', {type: 'danger', delay: 500,width:350});
			grecaptcha.reset();
			return false;
		}
		
		var formData = {email:email,password:user_password};
		
		$.ajax({
			url: ajax_url,
			type: "POST",
			dataType: 'json',
    		data: formData,
			cache : false,
			success: function (result) {
				if(result.status=='OK'){
					$.bootstrapGrowl(result.msg, {type: 'success', delay: 700,width:350});
					setTimeout(function() { location.reload(); },900);
				}else{
					$.bootstrapGrowl(result.msg, {type: 'danger', delay: 700,width:350});
				}
			},
			error: function (err) {
			 	console.log(err);
			 	$.bootstrapGrowl('Invalid request', {type: 'danger', delay: 700,width:350});
			}
		});
    });

    $("#form_update_profile").submit(function(event) {
        event.preventDefault();
        //var formData = new FormData( this );
        var ajax_url = '';
        
		ajax_url = '/update_profile';
        var form_id    = '#form_update_profile';
		
		var firstname 		= $.trim($(form_id+" #firstname").val());
		var lastname 		= $.trim($(form_id+" #lastname").val());
		var phone 			= $.trim($(form_id+" #phone").val());
		var address1 		= $.trim($(form_id+" #address1").val());
		var address2 		= $.trim($(form_id+" #address2").val());
		var city			= $.trim($(form_id+" #city").val());
		var state			= $.trim($(form_id+" #state").val());
		var country			= $.trim($(form_id+" #country").val());
		var zip				= $.trim($(form_id+" #zip").val());

		
		if(firstname==''){
			$.bootstrapGrowl('Firstname is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(lastname==''){
			$.bootstrapGrowl('Lastname is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(address1==''){
			$.bootstrapGrowl('Address1 is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(city==''){
			$.bootstrapGrowl('City is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(state==''){
			$.bootstrapGrowl('State is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(zip==''){
			$.bootstrapGrowl('Zip is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(country==''){
			$.bootstrapGrowl('Country is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		
		var formData = {
			firstname:firstname,
			lastname:lastname,
			phone:phone,
			address1:address1,
			address2:address2,
			city:city,
			state:state,
			country:country,
			zip:zip
		};

		$.ajax({
			url: ajax_url,
			type: "POST",
			dataType: 'json',
    		data: formData,
			cache : false,
			success: function (result) {
				if(result.status=='OK'){
					$.bootstrapGrowl('Your profile update successfull', {type: 'success', delay: 700,width:350});
					setTimeout(function() { location.reload(); },900);
				}else{
					$.bootstrapGrowl(result.msg, {type: 'danger', delay: 700,width:350});
				}
			},
			error: function (err) {
			 console.log(err);
			 $.bootstrapGrowl('Invalid request', {type: 'danger', delay: 700,width:350});
			}
		});
    });


     $('#edit-profile').change(function(e){
        /*var files = e.target.files,
        filesLength = files.length;
        for (var i = 0; i < filesLength; i++) {
            var f = files[i]
            var fileReader = new FileReader();
            fileReader.onload = (function(e) {
                var file = e.target;
                $("#ProfileImage").css("background-image","url("+e.target.result+")");
            });
            fileReader.readAsDataURL(f);
            }*/

        var action_url ="/update_profile_image";
        ajaxChangeProfileImage(action_url);
    });

    function ajaxChangeProfileImage(ajax_url){
    	var form = $('#form_profile_image')[0]; // You need to use standard javascript object here
    	var formData = new FormData(form);
        $.ajax({
            type: 'POST',
            url: ajax_url,
            data:  formData,
            processData: false,
            contentType: false,
            enctype: 'multipart/form-data',
            success: function (response)
            {
                if (response.status=='OK')
                {
                    $.bootstrapGrowl(response.msg, {type: 'success', delay: 500});
                    setTimeout(function() { location.reload(); }, 1000);
                } else
                {
                    $.bootstrapGrowl(response.msg, {type: 'danger', delay: 500});
                }
            }
        });
    }

    $("#form_contact_us").submit(function(event) {
    	 event.preventDefault();
    	var ajax_url = '/contact_us';
		var form_id    = '#form_contact_us';

		var name 		= $.trim($(form_id+" #contact-name").val());
		var from_email 	= $.trim($(form_id+" #contact-email").val());
		var message 	= $.trim($(form_id+" #contact-message").val());

		if(name==''){
			$.bootstrapGrowl('Name is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(from_email==''){
			$.bootstrapGrowl('Email is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(!isEmail(from_email)){
			$.bootstrapGrowl('Please enter valid email', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(message==''){
			$.bootstrapGrowl('Message is require', {type: 'danger', delay: 500,width:350});
			return false;
		}

		var formData = {
			name:name,
			from_email:from_email,
			message:message
		};

		$.ajax({
			url: ajax_url,
			type: "POST",
			dataType: 'json',
    		data: formData,
			cache : false,
			success: function (result) {
				if(result.status=='OK'){
					$("#form_contact_us")[0].reset();
					$.bootstrapGrowl('Mail sent successfully', {type: 'success', delay: 700,width:350});
				}else{
					$.bootstrapGrowl(result.msg, {type: 'danger', delay: 700,width:350});
				}
			},
			error: function (err) {
			 console.log(err);
			 $.bootstrapGrowl('Invalid request', {type: 'danger', delay: 700,width:350});
			}
		});
    });

    $("#form_subscribe_user").submit(function(event) {
    	 event.preventDefault();
    	var ajax_url = '/store_subscriber';
		var form_id    = '#form_subscribe_user';

		var from_email 	= $.trim($(form_id+" #subscriber_email").val());

		if(from_email==''){
			$.bootstrapGrowl('Email is require', {type: 'danger', delay: 500,width:350});
			return false;
		}
		if(!isEmail(from_email)){
			$.bootstrapGrowl('Please enter valid email', {type: 'danger', delay: 500,width:350});
			return false;
		}
		
		var formData = {
			email:from_email
		};

		$.ajax({
			url: ajax_url,
			type: "POST",
			dataType: 'json',
    		data: formData,
			cache : false,
			success: function (result) {
				if(result.status=='OK'){
					$("#form_subscribe_user")[0].reset();
					$.bootstrapGrowl('Subscription Successful', {type: 'success', delay:1000,width:350});
				}else{
					$.bootstrapGrowl(result.msg, {type: 'danger', delay: 700,width:350});
				}
			},
			error: function (err) {
			 console.log(err);
			 $.bootstrapGrowl('Invalid request', {type: 'danger', delay: 700,width:350});
			}
		});
    });
 });

 function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function sanitize(input){
	var regex = /^[ A-Za-z0-9_.,#&-]*$/;
	return regex.test(input);
}

function passwordCheck(pass){
	var regex = /^[A-Za-z0-9_@.#&+-]*$/
	return regex.test(pass);
}