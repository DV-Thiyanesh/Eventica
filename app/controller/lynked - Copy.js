//const User = require('mongoose').model('User');
const User = require('../models/User.js');
const Usertokenlw = require('../models/Usertokenlw.js');
var funcs = require('../functions');

var config = require('config');
Web3 = require('web3')
web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host') +":"+ config.get('ethereum.port')));


module.exports = function(app){


app.get('/login', function(req, res){

    res.render('signin', {
                pageTitle: 'Welcome - ' ,
                layout: false             
            });
    });


app.get('/signup', function(req, res){

    res.render('signup', {
                pageTitle: 'Welcome - ' ,
                layout: false             
            });
    });



app.post("/login_qr", function (req, res) {
	sess = req.session;
	Usertokenlw.findOne({ token: req.body.user_id }, (err, usertoken) => {
		var userData = {};
		if (err) { throw err; }

		if (!usertoken) {
			userData.email = req.body.email;
			userData.firstname = req.body.name;
      userData.lastname = '';
      userData.address1 = req.body.address;
      userData.city = req.body.city;
      userData.state = req.body.state;
      userData.country = req.body.country;
      userData.phone = req.body.phone;
      userData.headline = req.body.headline;
      userData.is_login_qr=1;
      userData.is_verify_email = req.body.is_verify_email;
      userData.is_verify_phone = req.body.is_verify_phone;
      userData.profile_image = req.body.profile_image;

      const newUser = new User(userData);
			newUser.save((err) => {
				var UsertokenData = {};
				
				UsertokenData.userid = newUser.id;
				UsertokenData.token = req.body.user_id;
			
				const newUsertoken = new Usertokenlw(UsertokenData);
				newUsertoken.save((err) => {
					if (err) { console.log(err); throw err.message;}
					sess.user = newUser;
					res.json(newUsertoken);
				}); // Usertokenlw save
			});
			
		} else {

			var uid= usertoken.userid;
			var mongoose = require('mongoose');
			var id = new mongoose.Types.ObjectId(uid);
			User.findOne({"_id":id}, (err, user) => {
				if(err){
					console.log(JSON.stringify(err));
				}

      user.email = req.body.email;
      user.firstname = req.body.name;
      user.address1 = req.body.address;
      user.city = req.body.city;
      user.state = req.body.state;
      user.country = req.body.country;
      user.phone = req.body.phone;
      user.headline = req.body.headline;
      user.is_login_qr=1;
      user.is_verify_email = req.body.is_verify_email;
      user.is_verify_phone = req.body.is_verify_phone;
      user.profile_image = req.body.profile_image;

       user.save((err) => {
          if (err) { console.log(err); throw err.message;}
          sess.user = user;

          //res.json(newUsertoken);

          res.json(user);

        }); // Usertokenlw save

				//sess.user = user;
				
        //console.log('2====',JSON.stringify(sess));
				//res.json(user);
			});
		}
	});
});



app.post("/login", function (req, res) {
    sess = req.session;
    var email     = req.body.email;
    var password     = req.body.password;

      const userData = {
            email: email.trim(),
            password: password.trim()
        };

        // find a user by email address
        User.findOne({ email: userData.email }, (err, user) => {
          console.log ("user...", user);

          if (err) { throw err; }

          if (!user) {
              return res.json({
                status:'Error',
                msg:'User details is not found for this email, please register....'
              });
          }

          // check if a hashed user's password is equal to a value saved in the database
           user.comparePassword(userData.password, (passwordErr, isMatch) => {
              if (err) { throw err; }

              if (!isMatch) {
                  return res.json({
                    status:'Error',
                    msg:'Incorrect email or password, please try again..'
                  });
                  
                  //req.flash('error', 'Incorrect email or password, please try again..');
                  //return res.redirect('/login');
                  // const error = new Error('Incorrect email or password');
                  // error.name = 'IncorrectCredentialsError';
                  // console.log("Password doesnt match...")
                  //res.json(error);
              } else {
                  sess.user = user;
              }
              
              return res.json({
                status:'OK',
                msg:'Login successful'
              });
              
              //res.redirect("/userorders");
           
           });
      });
});
//


app.get('/logout',function(req,res){
    req.session.destroy(function(err) {
          if(err) {
            console.log(err);
          } else {
            res.redirect('/');
          }
        });
});

app.post("/signup_ajax",  function (req, res) {
    sess = req.session;

    var email     = req.body.email;
    var password     = req.body.password;
    var repeatpassword   = req.body.repeatpassword;
    var firstname     = req.body.firstname;
    var lastname     = req.body.lastname;

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
                msg:'User account exists for this email address, reset password if you forgot the password'
            });
        }
        else{
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
    return res.json({
        status:'OK',
        msg:'Success'
    });

}); // save
} // if user found
}); //findUser
});

app.post("/signup",  function (req, res) {
sess = req.session;

      var email     = req.body.email;
      var password     = req.body.password;
      var repeatpassword   = req.body.repeatpassword;
      var firstname     = req.body.firstname;
      var lastname     = req.body.lastname;

          // const userData = {
          //       email: email.trim(),
          //       password: password.trim(),
          //       firstname: firstname,
          //       lastname: lastname
          //   };

          const userData = req.body;

            //console.log(userData);
            const newUser = new User(userData);

               if (password != repeatpassword){
                     req.flash('error', 'Password and Confirm password are not same....');
                 return res.redirect('/signup'); 
               }


           User.findOne({ email: req.body.email }, (errUser, userFound) => {
               if (errUser){
                     req.flash('error', 'Sign up...error, please try again...');
                     return res.redirect('/signup'); 
               }
               if (userFound) {
                         req.flash('error', 'User account exists for this email address, reset password if you forgot the password');
                      return res.redirect('/signup'); 
                }
                else{
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
                     res.redirect("/userorders");
            }); // save
        } // if user found
      }); //findUser
}); // signup 



app.get("/disclaimer", function (req, res) {
    //res.render("login");
   if (!isEmpty(sess)) 
   {
          message =  sess.error;
    }
  res.render("login/disclaimer", {
  pageTitle: ' ',
  message: message
});

});


app.get("/privacy", function (req, res) {
    //res.render("login");
    if (!isEmpty(sess)) 
    {
            message =  sess.error;
        }
    res.render("login/privacy", {
    pageTitle: ' ',
    message: message
    });

});


app.get('/forgot', function(req, res, next) {
  
    res.render('forgot', {
      user: req.session.user,
      name: "", 
      layout: false
    });

});

app.post('/forgot_ajax', function(req, res, next) {
  console.log(req.body);

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
                msg:'No account with that email address exists.'
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
              console.log("Details saved ", token);
              const sgMail = require('@sendgrid/mail');
              sgMail.setApiKey("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");
              const msg = {
                to: req.body.email,
                from: 'mail@lmico.com',
                subject: 'Request for password reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n',
              };

              sgMail.send(msg);
              console.log("Email sent...")
              message = 'An e-mail has been sent to ' + req.body.email + ' with further instructions.';
              req.flash('info', message);
              //done(err, 'done');

              return res.json({
                  status:'OK',
                  msg:'Email has been sent successfully,Please check your inbox'
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



app.post('/forgot', function(req, res, next) {
  console.log(req.body);

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
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
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
              console.log("Details saved ", token);
              const sgMail = require('@sendgrid/mail');
              sgMail.setApiKey("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");
              const msg = {
                to: req.body.email,
                from: 'mail@lmico.com',
                subject: 'Request for password reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n',
              };

              sgMail.send(msg);
              console.log("Email sent...")
              message = 'An e-mail has been sent to ' + req.body.email + ' with further instructions.';
              req.flash('info', message);
              //done(err, 'done');
               return res.redirect('/forgot');
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

// O0T6MDuURVOfa3b2OKI7WQ
// api-  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

app.get('/reset', function(req, res) {
    res.render('reset', {
      user: req.user,
         name: "",
         layout: false
    });
});


app.get('/reset/:token', function(req, res) {
  var async = require('async');
  var crypto = require('crypto');

      console.log("Token...", req.params.token);

 User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
 // User.findOne({ resetPasswordToken: req.params.token}, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      user: req.user,
      name: "",
      layout: false,
      token: req.params.token
    });
  });
});


app.post('/reset/:token', function(req, res) {
  var async = require('async');
  var crypto = require('crypto');
  var token = req.params.token;


  async.waterfall([
    function(done) {
        console.log("Token...", req.params.token);
       User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      
       // User.findOne({ resetPasswordToken: req.params.token }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/forgot');
          //return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err, user) {
              if (!user) {
                         console.log("error.. changed...");
                         req.flash('error', 'Password reset token is invalid or has expired.');
                         return res.redirect('/forgot');
              
              } else {
                    console.log("password changed...");
                    req.flash('success', 'Password changed successfully, login using new password...');
                    return res.redirect('/forgot');

            // } else {
            //     done(err, user);
             }

        });
      });
    },
  
   function(token, user, done) {

    // configurations 
              console.log("Details saved ", token);
              const sgMail = require('@sendgrid/mail');
              sgMail.setApiKey(config.get('sendgrid.api'));

              var msg = {
                to: 'saravana.malaichami@gmail.com',
                from: 'test@example.com',
                subject: 'Sending with SendGrid is Fun',
               text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
              };

              sgMail.send(msg);
              console.log("Email sent...");
              req.flash('success', 'Success! Your password has been changed., login using new password...');        
               return res.redirect('/forgot');
    }
  ], function(err) {
    if (err) return next(err);
    req.flash('error', 'Errror, please try again..');
    res.redirect('/forgot');
  });


  //   function(user, done) {
  //     var smtpTransport = nodemailer.createTransport('SMTP', {
  //       service: 'SendGrid',
  //       auth: {
  //         user: '!!! YOUR SENDGRID USERNAME !!!',
  //         pass: '!!! YOUR SENDGRID PASSWORD !!!'
  //       }
  //     });
  //     var mailOptions = {
  //       to: user.email,
  //       from: 'passwordreset@demo.com',
  //       subject: 'Your password has been changed',
  //       text: 'Hello,\n\n' +
  //         'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
  //     };
  //     smtpTransport.sendMail(mailOptions, function(err) {
  //       req.flash('success', 'Success! Your password has been changed.');
  //       done(err);
  //     });
  //   }
  // ], function(err) {
  //   res.redirect('/');
  // });
});





}







//       var smtpTransport = nodemailer.createTransport('SMTP', {
//         service: 'SendGrid',
//         auth: {
//           user: '!!! YOUR SENDGRID USERNAME !!!',
//           pass: '!!! YOUR SENDGRID PASSWORD !!!'
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: 'passwordreset@demo.com',
//         subject: 'Node.js Password Reset',
//         text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
//           'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//           'http://' + req.headers.host + '/reset/' + token + '\n\n' +
//           'If you did not request this, please ignore this email and your password will remain unchanged.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function(err) {
//         req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
//         done(err, 'done');
//       });


// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey("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");
// const msg = {
//   to: 'saravana.malaichami@gmail.com',
//   from: 'test@example.com',
//   subject: 'Sending with SendGrid is Fun',
//   text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
//           'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//           'http://' + req.headers.host + '/reset/' + token + '\n\n' +
//           'If you did not request this, please ignore this email and your password will remain unchanged.\n',
// };

// sgMail.send(msg);