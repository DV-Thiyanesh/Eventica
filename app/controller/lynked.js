//const User = require('mongoose').model('User');
const User = require('../models/User.js');
const Subscriber = require('../models/Subscriber.js');
const Usertokenlw = require('../models/Usertokenlw.js');
var funcs = require('../functions');

var config = require('config');
Web3 = require('web3')
web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host') +":"+ config.get('ethereum.port')));
const fs = require("fs");
const path = require('path');
module.exports = function(app){


app.post("/login_qr", function (req, res) {
	sess = req.session;
  var fullname='';
  var name_str='';

  if(typeof req.body!='undefined' && typeof req.body.name!='undefined'){
    name_str=req.body.name;
    fullname=name_str.split(" ");
  }

	Usertokenlw.findOne({ token: req.body.user_id }, (err, usertoken) => {
		
		var userData = {};
		if (err) { /* throw err; */ }
		if (!usertoken) {
			if(fullname.length>1) {
				userData.firstname=fullname[0];
				var lname='';
				for(var i=1;i<fullname.length;i++) {
					lname +=fullname[i]+' ';
				}
				userData.lastname=lname.trim();
			} else {
				userData.firstname=fullname;
				userData.lastname='';
			}
			var ref_unq = 0;
			do {
				/* var referralcode = (Math.floor(Math.random() * 100000) + 1)+"";
				if(referralcode.length < 6){
					for(i=0;i< (7 - referralcode.length);i++){
					 	referralcode = "0"+(referralcode);
					}
				} */
				
				var referralcode = Math.floor(100000 + Math.random() * 900000);
				
				userData.referralcode = referralcode;
				User.find({referralcode: referralcode}).exec(function(err,referrals) {
					if(referrals.length==0) {
						ref_unq = 1;
					} else {
						ref_unq = 0; //try gen new code
					}
				});
	        } while (ref_unq > 1);
			userData.email = req.body.email;
			//userData.firstname = req.body.name;
			//userData.lastname = '';
			userData.address1 = req.body.address_1;
			userData.address2 = req.body.address_2;
			userData.city = req.body.city;
			userData.state = req.body.state;
			userData.country = req.body.country;
			userData.zip = req.body.zip;
			userData.phone = req.body.phone;
			userData.headline = req.body.headline;
			userData.is_login_qr=1;
			userData.is_verify_email = req.body.is_verify_email;
			userData.is_verify_phone = req.body.is_verify_phone;
			userData.profile_image = req.body.profile_image;
			userData.status = 'PENDING';
            userData.updated_at =  Date.now();

			const newUser = new User(userData);
			newUser.save((err) => {
				var UsertokenData = {};
				UsertokenData.userid = newUser.id;
				UsertokenData.token = req.body.user_id;
				const newUsertoken = new Usertokenlw(UsertokenData);
				newUsertoken.save((err) => {
					if (err) { console.log(err); /* throw err.message; */ }
					sess.user = newUser;
					//res.json(newUsertoken);
					return res.json({status:'OK', message: "Login Successful"});
				}); // Usertokenlw save
			});
		} else {
			var uid= usertoken.userid;
			var mongoose = require('mongoose');
			var id = new mongoose.Types.ObjectId(uid);
			User.findOne({_id:id}, (err, user) => {
				if(err){
					console.log(JSON.stringify(err));
				}
				if(user) {

					if(fullname.length>2){
					  user.firstname=fullname[0];
					  user.lastname=fullname[1]+' '+fullname[2];
					}else{
					  user.firstname=fullname[0];
					  user.lastname=fullname[1];
					}
					
					if(typeof req.body.email!='undefined' && req.body.email.trim()!=''){
						user.email = req.body.email.trim();
					}
					if(typeof req.body.address_1!='undefined' && req.body.address_1.trim()!=''){
						user.address1 = req.body.address_1.trim();
					}
					if(typeof req.body.address_2!='undefined' && req.body.address_2.trim()!=''){
						user.address2 = req.body.address_2.trim();
					}
					if(typeof req.body.city!='undefined' && req.body.city.trim()!=''){
						user.city = req.body.city.trim();
					}
					if(typeof req.body.state!='undefined' && req.body.state.trim()!=''){
						user.state = req.body.state.trim();
					}
					if(typeof req.body.country!='undefined' && req.body.country.trim()!=''){
						user.country = req.body.country.trim();
					}
					if(typeof req.body.zip!='undefined' && req.body.zip.trim()!=''){
						user.zip = req.body.zip.trim();
					}
					if(typeof req.body.phone!='undefined' && req.body.phone.trim()!=''){
						user.phone = req.body.phone.trim();
					}
					
					//Update KYC Upload Flag
	               	if(typeof user!='undefined'){
	                  	if(typeof user.email!='undefined' && user.email!=''){
	                      verify_email=1;
	                  	}
	                  	if(typeof user.file1!='undefined' && user.file1!=''){
	                    	check_identity=1;
	                  	}
	                  	if(typeof user.file3!='undefined' && user.file3!=''){
	                    	is_second_identity=1;
	                  	}
	                  	if(typeof user.is_both_identity!='undefined' && user.is_both_identity==1){
	                    	is_both_identity=1;
	                  	}
	                	if(typeof req.body.address_1!='undefined' && req.body.address_1.trim()!=''){
	                  		verify_address=1;
	                  	}else if(typeof user!='undefined' && typeof user.address1!='undefined' && user.address1.trim()!=''){
							verify_address=1;
	                  	}

	                  	if((check_identity==1 && is_both_identity==1) || (check_identity==1 && is_second_identity==1) || (check_identity==1 && is_both_identity==1 && is_second_identity==1)){
	                    	verify_kyc_upload=1;
	                  	}

	                  	if(verify_email==1 && verify_address==1 && verify_kyc_upload==1){
	                    	user.KYCUploaded =  "Yes";
	                  	}else{
	                    	user.KYCUploaded =  "No";
	                  	}
					}

					/*user.email = req.body.email;
					user.address1 = req.body.address_1;
					user.address2 = req.body.address_2;
					user.city = req.body.city;
					user.state = req.body.state;
					user.country = req.body.country;
					user.zip = req.body.zip;
					user.phone = req.body.phone;*/

					user.headline = req.body.headline;
					user.is_login_qr=1;
					user.is_verify_email = req.body.is_verify_email;
					user.is_verify_phone = req.body.is_verify_phone;
					user.profile_image = req.body.profile_image;

					user.save((err) => {
						if (err) {
							console.log("new if => ", err);
							//throw err.message;
							//res.json(err.message);
							var err_msg = err.message;
							if(err.code == 11000) {
								//err_msg = "Your email already registered! Try forgot password below!";
								User.update({"email": req.body.email}, {$set: user}, function (err, updateusers) {
									if (err) {
									}
									Usertokenlw.deleteMany({token: req.body.user_id}, function(err, obj) {
										if (err) {
											console.log(err);
											/* throw err.message; */
										}
										var UsertokenData = {};
										UsertokenData.userid = updateusers.id;
										UsertokenData.token = req.body.user_id;

										const newUsertoken = new Usertokenlw(UsertokenData);
										newUsertoken.save((err) => {
											if (err) {
												console.log(err);
												/* throw err.message; */
											}
											sess.user = newUser;
											//res.json(newUsertoken);
											return res.json({status:'OK', message: "Login Successful"});
										}); // Usertokenlw save
									
									}); // Usertokenlw delete
								});
							}
							return res.json({status:'Error', message: err_msg});
						}
						sess.user = user;
						//res.json(newUsertoken);
						//res.json(user);
						return res.json({status:'OK', message: "Login Successful"});
					}); // Usertokenlw save
				} else {
					User.findOne({email: req.body.email}, (err, user) => {
						if(err){
							console.log(JSON.stringify(err));
						}
						if(user) {

			              if(fullname.length>2){
			                user.firstname=fullname[0];
			                user.lastname=fullname[1]+' '+fullname[2];
			              }else{
			                user.firstname=fullname[0];
			                user.lastname=fullname[1];
			              }

			              	if(typeof req.body.email!='undefined' && req.body.email.trim()!=''){
			              		user.email = req.body.email.trim();
			              	}
			              	if(typeof req.body.address_1!='undefined' && req.body.address_1.trim()!=''){
			              		user.address1 = req.body.address_1.trim();
			              	}
			              	if(typeof req.body.address_2!='undefined' && req.body.address_2.trim()!=''){
			              		user.address2 = req.body.address_2.trim();
			              	}
			              	if(typeof req.body.city!='undefined' && req.body.city.trim()!=''){
			              		user.city = req.body.city.trim();
			              	}
			              	if(typeof req.body.state!='undefined' && req.body.state.trim()!=''){
			              		user.state = req.body.state.trim();
			              	}
			              	if(typeof req.body.country!='undefined' && req.body.country.trim()!=''){
			              		user.country = req.body.country.trim();
			              	}
			              	if(typeof req.body.zip!='undefined' && req.body.zip.trim()!=''){
			              		user.zip = req.body.zip.trim();
			              	}
			              	if(typeof req.body.phone!='undefined' && req.body.phone.trim()!=''){
			              		user.phone = req.body.phone.trim();
			              	}
			              	
          					//Update KYC Upload Flag
          	               	if(typeof user!='undefined'){
          	                  	if(typeof user.email!='undefined' && user.email!=''){
          	                      verify_email=1;
          	                  	}
          	                  	if(typeof user.file1!='undefined' && user.file1!=''){
          	                    	check_identity=1;
          	                  	}
          	                  	if(typeof user.file3!='undefined' && user.file3!=''){
          	                    	is_second_identity=1;
          	                  	}
          	                  	if(typeof user.is_both_identity!='undefined' && user.is_both_identity==1){
          	                    	is_both_identity=1;
          	                  	}
          	                	if(typeof req.body.address_1!='undefined' && req.body.address_1.trim()!=''){
          	                  		verify_address=1;
          	                  	}else if(typeof user!='undefined' && typeof user.address1!='undefined' && user.address1.trim()!=''){
          							verify_address=1;
          	                  	}

          	                  	if((check_identity==1 && is_both_identity==1) || (check_identity==1 && is_second_identity==1) || (check_identity==1 && is_both_identity==1 && is_second_identity==1)){
          	                    	verify_kyc_upload=1;
          	                  	}

          	                  	if(verify_email==1 && verify_address==1 && verify_kyc_upload==1){
          	                    	user.KYCUploaded =  "Yes";
          	                  	}else{
          	                    	user.KYCUploaded =  "No";
          	                  	}
          					}

							/*user.email = req.body.email;
							user.address1 = req.body.address_1;
							user.address2 = req.body.address_2;
							user.city = req.body.city;
							user.state = req.body.state;
							user.country = req.body.country;
							user.zip = req.body.zip;
							user.phone = req.body.phone;*/

							user.headline = req.body.headline;
							user.is_login_qr=1;
							user.is_verify_email = req.body.is_verify_email;
							user.is_verify_phone = req.body.is_verify_phone;
							user.profile_image = req.body.profile_image;

							User.update({"email": req.body.email}, {$set: user}, function (err, updateusers) {
								if (err) {
								}
								Usertokenlw.deleteMany({token: req.body.user_id}, function(err, obj) {
									if (err) {
										console.log(err);
										/* throw err.message; */
									}
									var UsertokenData = {};
									UsertokenData.userid = user.id;
									UsertokenData.token = req.body.user_id;

									const newUsertoken = new Usertokenlw(UsertokenData);
									newUsertoken.save((err) => {
										if (err) {
											console.log(err);
											/* throw err.message; */
										}
										sess.user = newUser;
										//res.json(newUsertoken);
										return res.json({status:'OK', message: "Login Successful"});
									}); // Usertokenlw save
								
								}); // Usertokenlw delete
								sess.user = user;
								return res.json({status:'OK', message: "Login Successful"});
							});
						} else {
              if(fullname.length>2){
                userData.firstname=fullname[0];
                userData.lastname=fullname[1]+' '+fullname[2];
              }else{
                userData.firstname=fullname[0];
                userData.lastname=fullname[1];
              }
              var ref_unq = 0;
              				do {
								/* var referralcode = (Math.floor(Math.random() * 100000) + 1)+"";
								if(referralcode.length < 6){
									for(i=0;i< (7 - referralcode.length);i++){
									 	referralcode = "0"+(referralcode);
									}
								} */
								
								var referralcode = Math.floor(100000 + Math.random() * 900000);
								userData.referralcode = referralcode;
								User.find({referralcode: referralcode}).exec(function(err,referrals) {
									if(referrals.length==0) {
										ref_unq = 1;
									} else {
										ref_unq = 0; //try gen new code
									}
								});
					        } while (ref_unq > 1);
							userData.email = req.body.email;
							//userData.firstname = req.body.name;
							//userData.lastname = '';
							userData.address1 = req.body.address_1;
							userData.address2 = req.body.address_2;
							userData.city = req.body.city;
							userData.state = req.body.state;
							userData.country = req.body.country;
							userData.zip = req.body.zip;
							userData.phone = req.body.phone;
							userData.headline = req.body.headline;
							userData.is_login_qr=1;
							userData.is_verify_email = req.body.is_verify_email;
							userData.is_verify_phone = req.body.is_verify_phone;
							userData.profile_image = req.body.profile_image;
							userData.status = 'PENDING';
                            userData.updated_at =  Date.now();

							const newUser = new User(userData);
							newUser.save((err) => {
								if (err) {
									console.log("new else => ", err);
									//throw err.message;
									//res.json(err.message);
									var err_msg = err.message;
									if(err.code == 11000) {
										err_msg = "Your email already registered! Try forgot password!";
									}
									return res.json({status:'Error', message: err_msg});
								}
								Usertokenlw.deleteMany({token: req.body.user_id}, function(err, obj) {
									if (err) { console.log(err); /* throw err.message; */ }
									var UsertokenData = {};
									UsertokenData.userid = newUser.id;
									UsertokenData.token = req.body.user_id;

									const newUsertoken = new Usertokenlw(UsertokenData);
									newUsertoken.save((err) => {
										if (err) { console.log(err); /* throw err.message; */ }
										sess.user = newUser;
										//res.json(newUsertoken);
										return res.json({status:'OK', message: "Login Successful"});
									}); // Usertokenlw save
								
								}); // Usertokenlw delete
							});
						}
					});
				}
			});
		}
	});
});

app.post("/signup_ajax",  function (req, res) {
    sess = req.session;
    const nodemailer 	= require('nodemailer');
	var check_email 	= req.body.email.trim();
    var email     		= req.body.email.trim();
    var password     	= req.body.password.trim();
    var repeatpassword  = req.body.repeatpassword.trim();
    var firstname     	= req.body.firstname.trim();
    var lastname     	= req.body.lastname.trim();

    if(firstname==''){
        return res.json({
            status:'Error',
            msg:'Firstname is required'
        });
    }
    if(firstname.length>40){
        return res.json({
            status:'Error',
            msg:'Firstname required maximum 40 characters'
        });
    }
    if(!funcs.inputSanitize(firstname)) {
    	return res.json({
    	    status:'Error',
    	    msg:'Firstname allow alpha-numeric characters.'
    	});
    }
    if(lastname==''){
        return res.json({
            status:'Error',
            msg:'Lastname is required'
        });
    }
    if(lastname.length>40){
        return res.json({
            status:'Error',
            msg:'Lastname required maximum 40 characters'
        });
    }
    if(!funcs.inputSanitize(lastname)) {
    	return res.json({
    	    status:'Error',
    	    msg:'Lastname allow alpha-numeric characters.'
    	});
    }

    if(typeof req.body.email=='undefined' || req.body.email==''){
        return res.json({
            status:'Error',
            msg:'Email Address is required'
        });
    }

    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(!regex.test(check_email)){
        return res.json({
            status:'Error',
            msg:'Please enter valid email address'
        });
    }

    if(password==''){
        return res.json({
            status:'Error',
            msg:'Password is required'
        });
    }

    if(password.length<8){
        return res.json({
            status:'Error',
            msg:'Password required minimum 8 characters'
        });
    }
    if(password.length>15){
        return res.json({
            status:'Error',
            msg:'Password allow maximum 15 characters'
        });
    }

    if(!funcs.passwordCheck(password)) {
    	return res.json({
    	    status:'Error',
    	    msg:'Password allow alpha-numeric and pre-defined special characters. (_@.#-)'
    	});
	}

    if(repeatpassword==''){
        return res.json({
            status:'Error',
            msg:'Confirm Password is required'
        });
    }

    if(password!=repeatpassword){
        return res.json({
            status:'Error',
            msg:'Password and Confirm Password does not match.'
        });
    }

    User.find({referralcode: req.body.referred_by}).exec(function(err,user_referrals) {
	    if((typeof user_referrals == 'undefined' || user_referrals.length == 0 || err) && req.body.referred_by.trim() != ""){
		    return res.json({
		            status:'Error',
		            msg:'Invalid referral code!'
		        });
		} else {
			if(typeof user_referrals != 'undefined' && req.body.referred_by.trim() != "" && user_referrals.length > 0){
				req.body.referralby = user_referrals[0]['id'];
			
				if(typeof user_referrals[0]['email']!='undefined' && user_referrals[0]['email']!=''){
				    req.body.referralbyemail=user_referrals[0]['email'];
				}
			}


		    var ref_unq = 0;
		    do {
				 var referralcode = Math.floor(100000 + Math.random() * 900000);
				 
				 //var referralcode = (Math.floor(Math.random() * 100000) + 1)+"";
				 /* if(referralcode.length < 6){
				 	for(i=0;i< (7 - referralcode.length);i++){
					 	referralcode = "0"+(referralcode);
					}
				 } */
				 
				req.body.referralcode = referralcode;
				User.find({referralcode: referralcode}).exec(function(err,referrals) {
					if(referrals.length==0) {
						ref_unq = 1;
					} else {
						ref_unq = 0; //try gen new code
					}
				});
		    } while (ref_unq > 1);

		    const userData = req.body;
		    //console.log(userData);
		    const newUser = new User(userData);

		    if (password != repeatpassword){
		        return res.json({
		            status:'Error',
		            msg:'Password and Confirm password are not same....'
		        });
		    }

		    User.findOne({ email: req.body.email }, (errUser, userFound) => {
		        if (errUser){
		            return res.json({
		                status:'Error',
		                msg:'Sign up...error, please try again...'
		            });
		        }
		        if (userFound) {
		            return res.json({
		                status:'Error',
		                msg:'User account exists for this email address.'
		            });

		        }
		        else{
		          userData["status"] = config.get('general.userSignupInitStatus'); // "PENDING";
		          userData["currency"] =  "USD";
            	  userData["updated_at"] =  Date.now();

		          const newUser = new User(userData);
		            newUser.save((err) => {
		            if (err) { console.log(err); throw err.message;}
		            // mail chimp integration
		            if( config.get('mailchimp.enabled') == "1") {
		                var request = require('superagent');
		                var mailchimpInstance   = config.get('mailchimp.mailchimpInstance'); //'us17',
		                var listUniqueId        = config.get('mailchimp.listUniqueId');  // '4a4c2a0f58',
		                var mailchimpApiKey     = config.get('mailchimp.mailchimpApiKey');   //'adc1834d485062b3f3e4355c1c8e4b75-us17';

		                request
		                    .post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueId + '/members/')
		                    .set('Content-Type', 'application/json;charset=utf-8')
		                    .set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64'))
		                    .send({
		                        'email_address': email.trim(),
		                        'status': 'subscribed',
		                        'merge_fields': {
		                            'FNAME': firstname,
		                            'LNAME': lastname
		                        }
		                    })
		                    .end(function(err, response) {
		                        if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
		                            console.log('Signed up....');

		                        } else {
		                            console.log('Sign Up Failed :(', err);

		                        }

		                    });

		        var sleep = require('system-sleep');
		        sleep(2000); // sleep 2 sec


		        var request = require('superagent');
		        var mailchimpInstance             = config.get('mailchimp.mailchimpInstance'); //'us17',
		        var listUniqueId                   = config.get('mailchimp.listUniqueId');  // '4a4c2a0f58',
		        var listUniqueIdPendingPayment     = config.get('mailchimp.listUniqueIdPendingPayment');   //'adc1834d485062b3f3e4355c1c8e4b75-us17';

		        request
		            .post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueIdPendingPayment + '/members/')
		            .set('Content-Type', 'application/json;charset=utf-8')
		            .set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64'))
		            .send({
		                'email_address': email.trim(),
		                'status': 'subscribed',
		                'merge_fields': {
		                    'FNAME': firstname,
		                    'LNAME': lastname
		                }
		            })
		            .end(function(err, response) {
		                if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
		                    console.log('Signed up to second list......');
		                } else {
		                    console.log('Sign Up Failed :(', err);
		                }
		            });
		        } // if mailchimp - enabled...

		        sess.user = newUser;
		        var transporter = nodemailer.createTransport({
		          service: email_service,
		            host: email_host,
		            auth: {
		                user: email_user,
		                pass: email_pass
		            }
		        });

		        //send mail
		        var template = process.cwd() + '/views/emails/registration.ejs';
		        var html = fs.readFileSync(template);
		        var res1 = html.toString();
		        var unsubscriber_url = site_home_url+'verify-email/'+newUser.id
		        var res2 = res1.replace('email_verify_url1',unsubscriber_url);
		        var res3 = res2.replace('email_verify_url2',unsubscriber_url);
		        var res4 = res3.replace('email_verify_url3',unsubscriber_url);
		        var res5 = res4.replace('from_email',newUser.email);
		        var image_url =site_home_url+'assets/images/header_img.png';
		        var res6 = res5.replace('company_logo_url',image_url);

		        var mailOptions = {
		          from: '"Lynked.World" <noreply@lynked.world>',
		          to: newUser.email,
		          subject: 'Confirm your email',
		          html: res6
		        };

		        transporter.sendMail(mailOptions, function(error, info){
		          if(error){
		            console.log(error);
		          }
		        });

		        return res.json({
		            status:'OK',
		            msg:'Thank You for registration'
		        });

		      }); // save
		    } // if user found
		  }); //findUser
		}
	});
});


app.post('/forgot_ajax', function(req, res, next) {
  console.log(req.body);
const nodemailer = require('nodemailer');

var async = require('async');
var crypto = require('crypto');

  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
            return res.json({
                status:'Error',
                msg:'No account with this email address exists'
            });
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          console.log("Details saved ", token);
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
            /*  console.log("Details saved ", token);
              const sgMail = require('@sendgrid/mail');
              sgMail.setApiKey("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");
              const msg = {
                to: req.body.email,
             from: 'support@lynked.world',
                subject: 'Request for password reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n',
              };

              sgMail.send(msg);
              console.log("Email sent...")
              message = 'An e-mail has been sent to ' + req.body.email + ' with further instructions.';
              req.flash('info', message);*/
              //done(err, 'done');


              var transporter = nodemailer.createTransport({
                service: email_service,
                  host: email_host,
                  auth: {
                      user: email_user,
                      pass: email_pass
                  }
              });

        //send mail
        var template = process.cwd() + '/views/emails/reset.ejs';
        var html = fs.readFileSync(template);
        var image_url =site_home_url+'assets/images/header_img.png';
        var unsubscriber_url = site_home_url+'reset/'+token;
        var res1 = html.toString();
        var res2 = res1.replace('reset_link',unsubscriber_url);
        var res3 = res2.replace('reset_link2',unsubscriber_url);
        var res4 = res3.replace('from_email',req.body.email);
        var res5 = res4.replace('company_logo_url',image_url);
        var res6 = res5.replace('reset_link3',unsubscriber_url);


        var mailOptions = {
          from: 'Lynked.World<noreply@lynked.world>',
          to: req.body.email,
          subject: 'Reset Password',
          html: res6
        };

        transporter.sendMail(mailOptions, function(error, info){
          if(error){
            console.log(error);
          }
        });

        return res.json({
            status:'OK',
            msg:'Instructions to reset your password has been sent to your email. Please check your inbox'
      });
    }
  ], function(err) {
    if (err) return next(err);
      return res.json({
          status:'Error',
          msg:'Invalid request'
      });
  });
});

app.post('/update_profile_image', function (req, res) {
  sess = req.session;
  var sampleFile;
  if(funcs.isEmpty(sess.user)) {
      return res.json({
        status:'Error',
        msg:'Session expire,Please try to login.!'
      });
  } else {
    var uid = sess.user["_id"];
    var mongoose = require('mongoose');
    var id = new mongoose.Types.ObjectId(uid);

    if (!req.files) {
      return res.json({
        status:'Error',
        msg:'No files were uploaded.'
      });
    }

    if(req.files.profile_image) {
        sampleFile = req.files.profile_image;
      
        var uploadPath ="./public/uploads/users/" +uid + "/";
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath);
        }

          var fileNameWithPath ="./public/uploads/users/"+uid+'/'+sampleFile.name;
          var allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
          var extension = sampleFile.mimetype;
          if (allowedTypes.indexOf(extension) === -1) {
            return res.json({
              status: 'Error',
              msg: 'File type is not valid (PNG and JPG)'
            })
          }

          sampleFile.mv(fileNameWithPath, function (err) {
            if (err) {
                res.status(500).send(err);
            }
            else {
              var SaveOBj = {};
              if (req.files.profile_image.name) {
                  SaveOBj.profile_image = req.files.profile_image.name;
              }
               User.update({"_id": id}, {$set: SaveOBj}, function (err, updateusers) {
                  if (err) {
                      return res.write('Error!');
                  }
                  return res.json({
                    status: 'OK',
                    msg: 'Profile image change succesfull'
                  })
              });
            }
        });
      }
    }
});

app.post('/contact_us', function(req, res, next) {
	const nodemailer = require('nodemailer')
	var to_email = 'info@lynked.world';

	  if(typeof req.body.from_email==undefined || req.body.from_email==''){
		  return res.json({
			status: 'Error',
			msg: 'Email is require'
		  })
	  }
	  if(typeof req.body.name==undefined || req.body.name==''){
		return res.json({
		  status: 'Error',
		  msg: 'Name is require'
		})
	  }
	  if(typeof req.body.message==undefined || req.body.message==''){
		return res.json({
		  status: 'Error',
		  msg: 'Message can not blank'
		})
	  }
	var transporter = nodemailer.createTransport({
      service: email_service,
        host: email_host,
        auth: {
            user: email_user,
            pass: email_pass
        }
	});
  
	//template
	var template = process.cwd() + '/views/emails/contactus.ejs';
	var html = fs.readFileSync(template);
	var res1 = html.toString();
	var res2 = res1.replace('from_email',req.body.from_email);
	var image_url =site_home_url+'assets/images/header_img.png';
	var res3 = res2.replace('company_logo_url',image_url);

	var mailOptions = {
		from: '"Lynked.World" <noreply@lynked.world>',
		to: req.body.from_email,
		subject: 'Thank you for getting in touch!',
		html: res3
	};
	
	Subscriber.findOne({ email: req.body.from_email}, function(err,email_data) {
		if(err){
			return res.json({
			  status:'Error',
			  msg:'Something went wrong, Please try again later.'
			});
		}else if(!email_data){
			var userData    = {};
			userData.email  = req.body.from_email;
			userData.name  = req.body.name;
			userData.message  = req.body.message;
			userData.status = 1;
			const newUser   = new Subscriber(userData);
			newUser.save((err) => {
				if (err) {
					return res.json({
						status:'Error',
						msg:'Fail to store subscribe detail'
					});
				}
				transporter.sendMail(mailOptions, function(error, info){
					if(error){
					  console.log(error);
					}
				}); 
				return res.json({
					status: 'OK',
					msg: 'Mail sent succesfully'
				});
			});
		}else{
			email_data.status = 1;
			email_data.name  = req.body.name;
			email_data.message  = req.body.message;
			email_data.save((err) => {
			if (err) { console.log(err); throw err.message;}
				transporter.sendMail(mailOptions, function(error, info){
					if(error){
					  console.log(error);
					}
				});
				return res.json({
					status: 'OK',
					msg: 'Mail sent succesfully'
				});
			});
		}
	});
});

app.post('/store_subscriber', function(req, res, next) {
  var image_url =site_home_url+'assets/images/header_img.png';
  var transporter = require('nodemailer').createTransport({
    service: email_service,
    host: email_host,
      auth: {
        user: email_user,
        pass: email_pass
      }
    });

  var email_id = ''; 
  if(typeof req.body.email=='undefined' || req.body.email==''){
      return res.json({
          status:'Error',
          msg:'Email is require'
      });
  }

  email_id = req.body.email;
  Subscriber.findOne({ email: email_id}, function(err,email_data) {
    if(err){
      return res.json({
          status:'Error',
          msg:'Something went wrong, Please try again later.'
      });
    }
    if (email_data) {
        email_data.status = 1;
        email_data.save((err) => {
          if (err) { console.log(err); throw err.message;}
           
            var template = process.cwd() + '/views/emails/subscriber.ejs';
            var html = fs.readFileSync(template);
            var res1 = html.toString();
            var unsubscriber_url = site_home_url+'unsubscribe/'+email_data.id
            var res2 = res1.replace('unsubscribe_url',unsubscriber_url);
            var res3 = res2.replace('from_email',email_data.email);
            var res4 = res3.replace('company_logo_url',image_url);

            var mailOptions = {
              from: '"Lynked.World" <noreply@lynked.world>',
              to: email_data.email,
              subject: 'Thank you for subscribing to our newsletter',
              html: res4
            };

            transporter.sendMail(mailOptions, function(error, info){
              if(error){
                console.log(error);
              }
            });

           return res.json({
            status: 'OK',
            msg: 'Subscription Successful'
          });
        });
      }else{
        var userData    = {};
        userData.email  = req.body.email;
        userData.status = 1;
        const newUser   = new Subscriber(userData);
        newUser.save((err) => {
          if (err) {
            return res.json({
                status:'Error',
                msg:'Fail to store subscribe detail'
            });
          }

          var template = process.cwd() + '/views/emails/subscriber.ejs';
          var html = fs.readFileSync(template);
          var res1 = html.toString();
          var unsubscriber_url = site_home_url+'unsubscribe/'+newUser.id
          var res2 = res1.replace('unsubscribe_url',unsubscriber_url);
          var res3 = res2.replace('from_email',newUser.email);
          var res4 = res3.replace('company_logo_url',image_url);

          var mailOptions = {
            from: '"Lynked.World" <noreply@lynked.world>',
            to: newUser.email,
            subject: 'Thank you for subscribing to our newsletter',
            html: res4
          };

          transporter.sendMail(mailOptions, function(error, info){
            if(error){
              console.log(error);
            }
          });

          return res.json({
              status:'OK',
              msg:'Subscription Successful'
          });
        });
      }
    });
});

app.get('/unsubscribe/:id', function(req, res) {
  var sid = (typeof req.params!='undefined' && typeof req.params.id!='undefined' && req.params.id!='')?req.params.id:'';
  if(sid==''){
    return res.json('Invalid argument');
  }

    var uid= req.params.id;
    var mongoose = require('mongoose');
    var id = new mongoose.Types.ObjectId(uid);

      Subscriber.findOne({_id:uid}, function(err,subscriber) {
        if(err){
          return res.json({
              status:'Error',
              msg:'Something went wrong, Please try again later.'
          });
        }

        if (subscriber) {
          subscriber.status = 0;
          subscriber.save((err) => {
            if (err) { console.log(err); throw err.message;}
              res.render('thankyou', {
                pageTitle: 'Thank You' ,
                message:'You have successfully unsubscribed!',
                layout: false             
              });
          });
        }

      });
  });

app.get('/verify-email/:id', function(req, res) {
  var sid = (typeof req.params!='undefined' && typeof req.params.id!='undefined' && req.params.id!='')?req.params.id:'';
    if(sid==''){
      return res.json('Invalid argument');
    }

    var uid= req.params.id;
    var mongoose = require('mongoose');
    var id = new mongoose.Types.ObjectId(uid);

      User.findOne({_id:uid}, function(err,user) {
        if(err){
          return res.json({
              status:'Error',
              msg:'Something went wrong, Please try again later.'
          });
        }

        if (user) {
           	var check_identity=0;
           	var is_second_identity=0;
           	var is_both_identity=0;
           	var verify_email=0;
			var verify_address=0;
			var verify_kyc_upload=0;

           if(typeof user!='undefined'){
              	if(typeof user.email!='undefined' && user.email!=''){
	                 verify_email=1;
              	}

              	if(typeof user.file1!='undefined' && user.file1!=''){
                	check_identity=1;
              	}

              	if(typeof user.file3!='undefined' && user.file3!=''){
                	is_second_identity=1;
              	}
              	
              	if(typeof user.is_both_identity!='undefined' && user.is_both_identity==1){
                	is_both_identity=1;
              	}

              	if(typeof user!='undefined' && typeof user.address1!='undefined' && user.address1.trim()!=''){
					verify_address=1;
              	}

              	if((check_identity==1 && is_both_identity==1) || (check_identity==1 && is_second_identity==1) || (check_identity==1 && is_both_identity==1 && is_second_identity==1)){
                	verify_kyc_upload=1;
              	}
			  
              	if(verify_email==1 && verify_address==1 && verify_kyc_upload==1){
                	user.KYCUploaded =  "Yes";
              	}else{
                	user.KYCUploaded =  "No";
              	}
        	}

          user.is_verify_email = 1;
          user.save((err) => {
            if (err) { console.log(err); throw err.message;}
             res.render('thankyou', {
                pageTitle: 'Thank You' ,
                message:'Email verification is successful.',
                layout: false             
              });
          });
        }
      });
  });

app.get('/test', function(req, res) {
  res.render('thankyou', {
      pageTitle: 'Thank You' ,
      message:'Email verification is successful.',
      layout: false             
    });
});


app.post('/change-password', function(req, res, next) {
  var password = (typeof req.body!='undefined' && typeof req.body.password!='undefined' && req.body.password.trim()!='')?req.body.password.trim():'';
  var cur_password = (typeof req.body!='undefined' && typeof req.body.current_password!='undefined' && req.body.current_password.trim()!='')?req.body.current_password.trim():'';
  
  if(cur_password==''){
     return res.json({
          status:'Error',
          msg:'Current Password is require'
      });
  }

  if(password==''){
     return res.json({
          status:'Error',
          msg:'Password is require'
      });
  }
  if(password.length<8){
     return res.json({
          status:'Error',
          msg:'Password required minimum 8 characters'
      });
  }
  if(password.length>15){
     return res.json({
          status:'Error',
          msg:'Password allow maximum 15 characters'
      });
  }

  if(!funcs.passwordCheck(password)) {
	  	return res.json({
	  	    status:'Error',
	  	    msg:'Password allow alpha-numeric and pre-defined special characters. (_@.#-)'
	  	});
	}


  sess = req.session;
  var uid = sess.user["_id"];
  var mongoose = require('mongoose');
  var user_id = new mongoose.Types.ObjectId(uid);

  User.findOne({_id:user_id}, (errUser, userFound) => {
    if(errUser){
      return res.json({
          status:'Error',
          msg:'Something went wrong,Please try again'
      });
    }
    if(userFound){
      userFound.comparePassword(cur_password, (passwordErr, isMatch) => {
              if (passwordErr) { throw passwordErr; }
              if (!isMatch) {
                  return res.json({
                    status:'Error',
                    msg:'Incorrect current password, please try again..'
                  });
                  
                  //req.flash('error', 'Incorrect email or password, please try again..');
                  //return res.redirect('/login');
                  // const error = new Error('Incorrect email or password');
                  // error.name = 'IncorrectCredentialsError';
                  // console.log("Password doesnt match...")
                  //res.json(error);
              } else {
                userFound.password = password;
                userFound.save((err) => {
                if (err) { console.log(err); throw err.message;}


                	//send change password mail
	                var image_url =site_home_url+'assets/images/header_img.png';
	                var site_url = site_home_url;
	                var transporter = require('nodemailer').createTransport({
	                  service: email_service,
	                  host: email_host,
	                    auth: {
	                      user: email_user,
	                      pass: email_pass
	                    }
	                });

	                var template = process.cwd() + '/views/emails/change_password.ejs';
	                var html = fs.readFileSync(template);
	                var res1 = html.toString();
	                var res2 = res1.replace('from_email',userFound.email);
	                var res3 = res2.replace('company_logo_url',image_url);
	                var res4 = res3.replace('verify_email',userFound.email);
	                var res5 = res4.replace('site_url',site_url);

	                var mailOptions = {
	                  from: '"Lynked.World" <noreply@lynked.world>',
	                  to: userFound.email,
	                  subject: 'Your password has been changed',
	                  html: res5
	                };

	                transporter.sendMail(mailOptions, function(error, info){
	                  if(error){
	                    console.log(error);
	                  }
	                });
	                
                   return res.json({
                      status:'OK',
                      msg:'Password change successfully'
                  });
              }); 
            }
      });
    }else{
      return res.json({
        status:'Error',
        msg:'Sorry, User not found'
      });
    }
  });
});

app.get('/resend-verify-email', function(req, res, next) {
    sess = req.session;
    const nodemailer = require('nodemailer')

    var uid = sess.user["_id"];
    var mongoose = require('mongoose');
    var user_id = new mongoose.Types.ObjectId(uid);

    User.findOne({_id:user_id}, (errUser, userFound) => {
      if(errUser){
        res.render('thankyou', {
          pageTitle: 'Thank You' ,
          message:'Something went wrong,Please try again',
          layout: false,
          error:1             
        });
      }else if(!userFound){
        res.render('thankyou', {
          pageTitle: 'Thank You' ,
          message:'Sorry,User not found,Please try again',
          layout: false,
          error:1             
        });
    }else{
        sess.user = userFound;
        var transporter = nodemailer.createTransport({
          service: email_service,
            host: email_host,
            auth: {
                user: email_user,
                pass: email_pass
            }
        });

        //send mail
        var template = process.cwd() + '/views/emails/registration.ejs';
        var html = fs.readFileSync(template);
        var res1 = html.toString();
        var unsubscriber_url = site_home_url+'verify-email/'+userFound.id
        var res2 = res1.replace('email_verify_url1',unsubscriber_url);
        var res3 = res2.replace('email_verify_url2',unsubscriber_url);
        var res4 = res3.replace('email_verify_url3',unsubscriber_url);
        var res5 = res4.replace('from_email',userFound.email);
        var image_url =site_home_url+'assets/images/header_img.png';
        var res6 = res5.replace('company_logo_url',image_url);

        var mailOptions = {
          from: '"Lynked.World" <noreply@lynked.world>',
          to: userFound.email,
          subject: 'Confirm your email',
          html: res6
        };

        transporter.sendMail(mailOptions, function(error, info){
          if(error){
            console.log(error);
          }
        });

        res.render('thankyou', {
          pageTitle: 'Thank You' ,
          message:'Email Confirmation link sent successfully',
          layout: false             
        });
      }
    });
});

app.get('/view-qr/:address', function(req, res, next) {
  var qr= require('qr-image');
  var address = (typeof req.params!='undefined' && typeof req.params.address!='undefined' && req.params.address!='')?req.params.address:'';
  if(address==''){
      return res.json({
        status:'Error',
        msg:'Address can not empty',
        data:''
      });
  }
  
  var svg_string = qr.imageSync(address,{ type: 'svg' });
  return res.json({
    status:'OK',
    msg:'Successful',
    data:svg_string
  });
});

function extend(target) {
    /* var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target; */
}


function length(obj) { return Object.keys(obj).length; }
     
var message= null;

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}



}


