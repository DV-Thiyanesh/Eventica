
const User = require('../models/User.js');
var funcs = require('../functions');

var config = require('config');
Web3 = require('web3')

// web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host')));
// const fs = require("fs");
// const path = require('path');

module.exports = function (app) {


  app.get('/signin', function (req, res) {

      res.render('signin', {
               pageTitle: 'Welcome - ' ,
                  layout: false             
           });
     //res.redirect('/signin');
  });


  app.get('/signup', function (req, res) {

    res.render('signup', {
      pageTitle: 'Welcome - ',
      layout: false
    });
  });



  app.post("/signin", function (req, res) {
    sess = req.session;
    var email = req.body.email;
    var password = req.body.password;

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
          status: 'Error',
          msg: 'User details is not found for this email, please register....'
        });
      }

      // check if a hashed user's password is equal to a value saved in the database
       user.comparePassword(userData.password, (passwordErr, isMatch) => {
         if (err) { throw err; }

        if (!isMatch) {
          return res.json({
            status: 'Error',
            msg: 'Incorrect email or password, please try again..'
          });

          //req.flash('error', 'Incorrect email or password, please try again..');
          //return res.redirect('/login');
          // const error = new Error('Incorrect email or password');
          // error.name = 'IncorrectCredentialsError';
          // console.log("Password doesnt match...")
          //res.json(error);
        } else {


          sess.user = user;
          // return res.json({
          //   status: 'OK',
          //   msg: 'Login successful'
          // });
          res.redirect("/eventica");
        } 

        //  return res.json({
        //    status:'OK',
        //    msg:'Login successfully'
        // });

          

      });
    });
  });
  


  app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  });



  app.post("/signup", function (req, res) {

    sess = req.session;

    var email = req.body.email;
    var password = req.body.password;
    var repeatpassword = req.body.repeatpassword;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
   
    const userData = req.body;

    // var currency = "USD";
    //  if (country == "Korea, Republic of") {
    //       currency = "KRW"
    //  } 
        
       //userData["status"] = config.get('general.userSignupInitStatus'); // "PENDING";
        // userData["currency"] = currency;

    const newUser = new User(userData);

    if (password != repeatpassword) {
      //  req.flash('error', 'Password and Confirm password are not same....');
      return res.redirect('/signup');
    }


    User.findOne({ email: req.body.email }, (errUser, userFound) => {
      if (errUser) {
        req.flash('error', 'Sign up...error, please try again...');
        return res.redirect('/signup');
      }
      if (userFound) {
        req.flash('error', 'User account exists for this email address, reset password if you forgot the password');
        return res.redirect('/signup');
      }
      else {
        newUser.save((err) => {
          if (err) { console.log(err); throw err.message; }
          // mail chimp integration 
         
          sess.user = newUser;
          res.redirect("/eventica");
        }); // save
      } // if user found
    }); //findUser
  }); // signup 

  app.post('/forgot', function (req, res) {
    console.log("reset password")
    sess = req.session;
    console.log(req.body);
    if (funcs.isEmpty(sess.user)) {
      res.redirect('/signin');
    } else {
      User.findById(req.session.user["_id"], (err, user) => {
        // user.comparePassword(req.body.oldPassword, (passwordErr, isMatch) => {
        //   if (err) { throw err; }

        //   if (!isMatch) {
        //     req.flash('error', 'Current password is  Incorrect');
        //     return res.redirect('/profile');
            // const error = new Error('Incorrect email or password');
            // error.name = 'IncorrectCredentialsError';
            // console.log("Password doesnt match...")
            //res.json(error);
          // } else {
          //   if (req.body.newPassword != req.body.repeatPassword) {
          //     req.flash('error', 'New password and Repeat password is mismatch');
          //     return res.redirect('/profile');
          //   }
          //   user.password = req.body.newPassword;
          //   user.save((err, usr) => {
          //     if (err) {
          //       console.log(err); throw err.message;
          //     }
          //     sess.user = "";
          //     //   req.session.destroy(function(err) {
          //     //     if(err) {
          //     //       console.log(err);
          //     //    } else {
          //     req.flash('success', 'Success! Your password has been changed.Login with new password');
          //     res.redirect('/signin');
              // }
              //   });  
            });
          }


        // });

      // })
     });
  //  })
    

  app.get("/disclaimer", function (req, res) {
    //res.render("login");
    if (!isEmpty(sess)) {
      message = sess.error;
    }
    res.render("login/disclaimer", {
      pageTitle: ' ',
      message: message
    });

  });


  app.get("/privacy", function (req, res) {
    //res.render("login");
    if (!isEmpty(sess)) {
      message = sess.error;
    }
    res.render("login/privacy", {
      pageTitle: ' ',
      message: message
    });

  });


  app.get('/forgot', function (req, res, next) {

    res.render('forgot', {
      user: req.session.user,
      name: "",
      layout: false
    });

  });


  app.post('/forgot', function (req, res, next) {
    console.log(req.body);

    var async = require('async');
    var crypto = require('crypto');

    async.waterfall([
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            console.log("Details saved ", token);
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
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
    ], function (err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });

  // O0T6MDuURVOfa3b2OKI7WQ
  // api-  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

  app.get('/reset', function (req, res) {
    res.render('reset', {
      user: req.user,
      name: "",
      layout: false
    });
  });


  app.get('/reset/:token', function (req, res) {
    var async = require('async');
    var crypto = require('crypto');

    console.log("Token...", req.params.token);
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
      if (err) {
        res.render('thankyou', {
          pageTitle: 'Reset Password',
          message: 'Something went wrong, Please try again..!',
          layout: false,
          error: 1
        });
      }
      else if (!user) {
        res.render('thankyou', {
          pageTitle: 'Reset Password',
          message: 'Password reset token is invalid or has expired.',
          layout: false,
          error: 1
        });
        /*req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/');*/
      } else {
        res.render('reset', {
          user: req.user,
          name: "",
          layout: false,
          token: req.params.token
        });
      }
    });
  });


  app.post('/reset/:token', function (req, res) {
    var async = require('async');
    var crypto = require('crypto');
    var token = req.params.token;

    async.waterfall([
      function (done) {
        console.log("Token...", req.params.token);
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {

          // User.findOne({ resetPasswordToken: req.params.token }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
            //return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function (err, user) {
            if (!user) {
              console.log("error.. changed...");
              req.flash('error', 'Password reset token is invalid or has expired.');
              //return res.redirect('/');

            } else {
              console.log("password changed...");
              req.flash('success', 'Password changed successfully, login using new password...');
              return res.redirect('/');

              // } else {
              //     done(err, user);
            }

          });
        });
      },

      function (token, user, done) {

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
    ], function (err) {
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


  //20-Jul-2018

  app.post('/reset-ajax/:token', function (req, res) {
    var async = require('async');
    var crypto = require('crypto');
    var token = req.params.token;
    console.log("Token...", req.params.token);
    console.log('Body====', req.body.password);

    async.waterfall([
      function (done) {
        console.log("Token...", req.params.token);
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
          if (!user) {
            return res.json({
              status: 'Error',
              msg: 'Password reset token is invalid or has expired.'
            });
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function (err, user) {
            if (!user) {
              return res.json({
                status: 'Error',
                msg: 'Password reset token is invalid or has expired.'
              });
            } else {
              var image_url = site_home_url + 'assets/images/header_img.png';
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
              var res2 = res1.replace('from_email', user.email);
              var res3 = res2.replace('company_logo_url', image_url);
              var res4 = res3.replace('verify_email', user.email);
              var res5 = res4.replace('site_url', site_url);

              var mailOptions = {
                from: '"Lynked.World" <noreply@lynked.world>',
                to: user.email,
                subject: 'Your password has been changed',
                html: res5
              };

              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                }
              });

              return res.json({
                status: 'OK',
                msg: 'Password changed successfully'
              });
            }
          });
        });
      },
      function (token, user, done) {
        /* var image_url =site_home_url+'assets/images/header_img.png';
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
           var res2 = res1.replace('from_email',user.email);
           var res3 = res2.replace('company_logo_url',image_url);
           var res4 = res3.replace('verify_email',user.email);

           var mailOptions = {
             from: 'Lynked.World<info@lynked.world+>',
             to: user.email,
             subject: 'Your password has been changed',
             html: res4
           };

           transporter.sendMail(mailOptions, function(error, info){
             if(error){
               console.log(error);
             }
           });*/

        return res.json({
          status: 'OK',
          msg: 'Password changed successfully'
        });
      }
    ], function (err) {
      if (err) return next(err);
      return res.json({
        status: 'Error',
        msg: 'Error, please try again..'
      });
    });
  })
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