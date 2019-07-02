// const Order = require('../models/Order.js');
const User = require('../models/User.js');
const Wallet = require('../models/Wallet.js');
const Order = require('../models/OrderNew.js');
const Usertokenlw = require('../models/Usertokenlw.js');

const express = require('express');
const path = require('path');
const multer = require("multer");
const fs = require("fs");

var funcs = require('../functions');
var config = require('config');
var bodyParser =    require("body-parser");
// Web3 = require('web3')
// web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host') +":"+ config.get('ethereum.port')));

Web3 = require('web3')
//global.web3 = new Web3(new Web3.providers.HttpProvider("http://18.196.131.108:8545"));

global.web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host')));

module.exports = function(app){

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));



const Wallet = require('../models/Wallet.js');

app.get('/getBalance/:ethaddress', function(req, res){
      var ethaddress = req.params.ethaddress;
      var balance = null;

     // console.log("Balance for ....", ethaddress);

      params = {publickey: ethaddress};
      Wallet.find(params).exec(function (err, wallet) {
          if(!wallet.length) {
            balance = 0
          }else {
            if (!funcs.isEmpty(wallet[0].balance)) {
              balance = wallet[0].balance;
          }else{
            balance = 0;
          };
          }
          console.log("Balance ...", balance);

        res.json(balance);
      });
});

app.get('/checkAddress',
  (req,res) => {
    const addr = req.query.addr;
    if(addr){
      res.json({status: web3.isAddress(addr)})
    }
    else {
      res.json({status: false})
    }
  })

app.get('/users', function(req, res){
        params = {}; 
        User.find(params).exec(function (err, users) {
                if (err) {
                    console.log(err);
                    } else {
                        console.log("Users...", users);
                        res.render('users', {
                                    pageTitle: 'Welcome - ' ,
                                    layout: false,
                                    users: users,
                                    name: req.session.user.firstname + " " + req.session.user.lastname,
                                    firstname: req.session.user.firstname,
                                    lastname: req.session.user.lastname,
                                    email: req.session.user.email,
                                    address: req.session.user.address,
                                    city: req.session.user.city,
                                    country: req.session.user.country,
                                    file : req.session.user.file,
                                    doc_type1 : req.session.user.doc_type1,
                                    doc_type2 : req.session.user.doc_type2,
                                    docnumber2 : req.session.user.doc_type2,
                                    docnumber1 : req.session.user.docnumber1
                                  });
               }
      }); //user find
});


//
// Remove an user 
//

app.post('/removeUser/:userid', function(req, res){

    console.log("Remove...", req.params.userid.trim());
    User.findById(req.params.userid, function(err, user) {
        if (err) {
               console.log(err);
               res.json("Remove error..");
        }
        else {
              user.remove((err, result) => {
              console.log("Removed...")
              res.json("Removed user account.." + user.email);
          });
        }
    });
});
//
//

//
// Make active 
//
//makeActiveUser
app.post('/makeActiveUser/:userid', function(req, res){

    console.log("Make active...", req.params.userid.trim());
    User.findById(req.params.userid, function(err, user) {
        if (err) {
               console.log(err);
               res.json("update error..");
        }
        else {
              user["status"] = "ACTIVE";
              user.save((err, result) => {
              console.log("Made active....")
              res.json("The account "+ user.email+ " is now Active...");
          });
        }
    });
});


//
// Suspend 
//
app.post('/suspendUser/:userid', function(req, res){

    console.log("Suspend...", req.params.userid.trim());
    User.findById(req.params.userid, function(err, user) {
        if (err) {
               console.log(err);
               res.json("update error..");
        }
        else {
              user["status"] = "SUSPENDED";
              user.save((err, result) => {
              console.log("Made active....")
              res.json("The account "+ user.email+ " is now suspended...");
          });
        }
    });
});

//
//
// 
app.get('/userwallets', function(req, res){

	sess = req.session;
	address = sess.address;  

	if(funcs.isEmpty(sess.user)) {
		res.redirect('/login');
	} else {
		console.log ("1 req.session.user[_id]...", req.session.user["_id"]);
		var params = {userid: req.session.user["_id"]};
		var orderDetails = [];
		//  params = {paymentstatus: 'Received'}; 
		//params = {}; 
		//
		//Order.find(params).sort([['updated', -1]]).exec(function (err, orders) {                  
		Order.find(params).sort([['orderdate', 1]]).exec(function (err, orders) {
			if (err) {
				console.log(err);
			}

			var alasql = require('alasql');
			var wallets = alasql('SELECT distinct ethaddress FROM ? ', [orders]);
			//CAST('7082.7758172' as float)
			for (i=0; i<wallets.length; i++){
				if (!funcs.isEmpty(wallets[i].ethaddress)){
					wallets[i]["balance"] = smartContract.balanceOf(wallets[i].ethaddress) / 1e18;
				}
			}

			var sleep = require('system-sleep');
			sleep(2000); // sleep 3 secs

			res.render('wallets', {
				layout: false,
				wallets: wallets,
				name: req.session.user.firstname + " " + req.session.user.lastname, 
				adminBalance: 100            
			});
		});
     } // else
});

app.get("/send", function (req, res) {
      sess = req.session;
      
      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
            res.render("sendtokens", {
                layout: false,
                name: req.session.user.firstname + " " + req.session.user.lastname,
                admin: config.get('ethereum.adminAddress'),
                adminBalance: smartContract.balanceOf(config.get('ethereum.adminAddress'))

              });
      }
});



app.get("/createwallet", function (req, res) {
      sess = req.session;
      
      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
            
          web3.personal.newAccount("password", function(errr, account) {
              console.log(account);
              res.json(account);
          });
      }
});



app.post("/send", function (req, res) {
      sess = req.session;


      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {

      console.log(req.body);

       // const name      = req.query.name;
        var email     = req.body.email;
        var toaddress = req.body.ethaddress;
        var tokens    = req.body.tokens;
        var password  = req.body.password;
        var message  = req.body.message;

        console.log(email);
        console.log(toaddress);
        console.log(tokens);
        console.log(password);


        if (tokens > smartContract.balanceOf(config.get('ethereum.adminAddress'))) {
                      req.flash('error', 'User account exists for this email address, reset password if you forgot the password');
                      return res.redirect('/send');
         }

         if (password != config.get('ethereum.adminPassword'))
          {
                      req.flash('error', 'Incorrect Tokens administrator password entered');
                      return res.redirect('/send');
          }

      // Web3 = require('web3')
      // web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host') +":"+ config.get('ethereum.port')));
      //   console.log(config.get('ethereum.adminAddress'));
         

        web3.personal.unlockAccount(config.get('ethereum.adminAddress'), password, function(err, unlocked){
             smartContract.transfer.sendTransaction(toaddress, tokens * 1e18, {
                    from: config.get('ethereum.adminAddress'),
                    gas: config.get('ethereum.gas'),
                    gasPrice: config.get('ethereum.gasPrice')
                }, function (error, txnno) {
                    if (error) {
                        console.error(error)
                              req.flash('error', 'Incorrect Tokens administrator password entered');
                              return res.redirect('/send');
                    } else {
                               console.log("Send transaction successful " + txnno)

                               const sgMail = require('@sendgrid/mail');
                                sgMail.setApiKey("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");
                                const msg = {
                                  to: email,
                                  from: 'mail@lmico.com',
                                  subject: 'You have received LMI tokens',
                                  text: 'You have received ' + tokens + 'LMI Tokens \n\n' + message
                                    
                                  
                                };

                                sgMail.send(msg);
                                console.log("Email sent...")
                                message = 'Token transfer is succesfull. TXN # '+txnno + '   An e-mail has been sent to ' + email + ' with token details..';
                                req.flash('success', message);
                                //done(err, 'done');
                                 return res.redirect('/send');

               }

       }); // transfer
      }); // unlock
      } // if session
       

});


//profile 
app.get('/profile', function (req, res) {

      sess = req.session;
       var host = req.headers.host;
            
      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
         message =  sess.message;

         curr_url = (typeof req.param!='undefined' && typeof req.param('flag')!='undefined')?req.param('flag'):0;
         
         var referralby = 0;
         if(typeof sess.user.referralby!='undefined' && sess.user.referralby!=''){
            referralby = sess.user.referralby;
         }

         User.findById(req.session.user["_id"], (err, user) => {

          User.findOne({_id:referralby}, (err, referred_data) => {

            var userID = req.session.user["_id"];

            Usertokenlw.findOne({userid:userID}, (err, userToken) => {
              if(err){
                console.log(err);
              }

              var user_token = 0;
             /* if(typeof userToken!='undefined' && userToken){
                if(typeof userToken.userid!='undefined' && userToken.userid!='' && userToken.userid!=null){
                  user_token=1;
                }
              }*/

              if(typeof user!='undefined' && typeof user.is_login_qr!='undefined' && user.is_login_qr==1){
                user_token=1;
              }

              var referred_name='';
              if(typeof referred_data!='undefined' && referred_data!=null){
                 is_refer=1;
                  var referred_name='';
                  var referred_code='';

                  if(typeof referred_data.firstname!='undefined' && referred_data.firstname!=''){
                    referred_name=referred_data.firstname;
                  }

                  if(typeof referred_data.lastname!='undefined' && referred_data.lastname!=''){
                    referred_name=referred_name+' '+referred_data.lastname;
                  }
              }

              var user_lastname = '';
              if(typeof req.session.user.lastname!='undefined' && req.session.user.lastname!=''){
                  user_lastname= " " +req.session.user.lastname
              }
              
              res.render('user_pages_profile', {
                 layout: false,
                   sidebar : true,
                   user: user,
                   name: req.session.user.firstname +user_lastname,
                   firstname: req.session.user.firstname,
                   lastname: user_lastname,
                   email: req.session.user.email,
                   address: req.session.user.address,
                   city: req.session.user.city,
                   country: req.session.user.country,
                   file1 : req.session.user.file1,
                   file3 :req.session.user.file2,
                   doc_type1 : req.session.user.doc_type1,
                   doc_type2 : req.session.user.doc_type2,
                   docnumber2 : req.session.user.docnumber2,
                    host:host,
                    message: message,
                   docnumber1 : req.session.user.docnumber1,
                   current_url:curr_url,
                   referred_name:referred_name,
                   userInfo:user,
                   qr_login:user_token
              });
            });
          });
        })
      }
    })
    
 var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.get('general.documentPath'))
  },
  filename: function (req, file, cb) {
    timestamp = Math.floor(new Date() / 1000);
    cb(null,timestamp+'_'+file.originalname);
    
  }
})
 var uploads = multer({ storage: storage })


//profile 
app.post('/profileUploadDocs',uploads.any(), function (req, res) {
      sess = req.session;
       
       if (funcs.isEmpty(req.files[0])) 
       {
          req.flash('error', 'No file selected in KYC, please try again...');
          return res.redirect('/profile');
       }

       if (funcs.isEmpty(req.files[1])) 
       {
          req.flash('error', 'No file selected in KYC, please try again...');
          return res.redirect('/profile');
       }

       var si=req.files[0].filename;
       var s2=req.files[1].filename;

      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {

                 // console.log(sess.user);
                 //var params = {userid: req.session.user["_id"]};
                  User.findById(req.session.user["_id"], (err, user) => {
                  // user["firstname"] = req.body.firstname;
                  // user["lastname"] = req.body.lastname;
                  // user["address1"] = req.body.address1;
                  // user["address2"] = req.body.address2;
                  // user["city"] = req.body.city;
                  // user["state"] =  req.body.state;
                  // user["country"] = req.body.country;
                  // user["zip"] = req.body.zip;
                  // user["phone"] = req.body.phone;
                  user["docnumber1"] = req.body.docnumber1;
                  user["docnumber2"] = req.body.docnumber2;
                  user["file1"] =si;
                  user["file2"] = s2;
                  user["doc_type1"] = req.body.doc_type1;   
                  user["doc_type2"] = req.body.doc_type2;   
                                             
                                             

                  var currency = "USD";
                   if (req.body.country == "Korea, Republic of") {
                        currency = "KRW"
                   } 
                   user["currency"]  = currency;
                                                    
                  sess.user = user;
                  console.log("User data...", user);

                  user.save((err, usr) => {
                    if (err) { console.log(err); throw err.message;}

                    req.flash('success', 'Details succesfully saved......');
                    return res.redirect('/profile');
                });
            });
        }
    });

app.post('/profile', function (req, res) {
  sess = req.session;
  if(funcs.isEmpty(sess.user)) {
      res.redirect('/login');
  } else {
    var referred_code = 0;
		if(typeof req.body.referred_by!='undefined' && req.body.referred_by!=''){
			referred_code = req.body.referred_by.trim();
		}
		
    var firstname   = req.body.firstname.trim();
    var lastname    = req.body.lastname.trim();
    var address1    = req.body.address1.trim();
    var address2    = req.body.address2.trim();
    var city        = req.body.city.trim();
    var state       = req.body.state.trim();
    var zip         = req.body.zip.trim();
    var country     = req.body.country.trim();
    var phone_no    = req.body.phone.trim();


		//Start :: validation
		if(typeof req.body.firstname=='undefined' || firstname==''){
			req.flash('error', 'Firstname is required');
			 return res.redirect('/profile');
		}

    if(firstname.length>40){
        req.flash('error', 'Firstname allow maximum 40 characters.');
        return res.redirect('/profile');
    }

    if(!funcs.inputSanitize(firstname)) {
      req.flash('error', 'Firstname allow alpha-numeric characters.');
       return res.redirect('/profile');
    }

    if(typeof req.body.lastname=='undefined' || lastname==''){
      req.flash('error', 'Lastname is required');
       return res.redirect('/profile');
    }

    if(lastname.length>40){
        req.flash('error', 'Lastname allow maximum 40 characters.');
        return res.redirect('/profile');
    }

    if(!funcs.inputSanitize(lastname)) {
      req.flash('error', 'Lastname allow alpha-numeric characters.');
       return res.redirect('/profile');
    }

		if(typeof req.body.address1=='undefined' || address1==''){
			req.flash('error', 'Address1 is required');
			 return res.redirect('/profile');
		}

    if(!funcs.addressSanitize(address1)) {
      req.flash('error', 'Address1 allow only alpha-numeric and pre-defined special characters. (_./:;,#&-)');
       return res.redirect('/profile');
    }

    if(phone_no!=''){
      if(phone_no.length>17){
          req.flash('error', 'Please enter correct phone number (maximum length 17 & allowed characters +.- 0-9 integers)');
          return res.redirect('/profile');
      }
      
      var isValid = false;
      var regex = /^[0-9+.-]*$/;
      isValid = regex.test(phone_no);
      if(!isValid){
          req.flash('error', 'Please enter correct phone number (maximum length 17 & allowed characters +.- 0-9 integers)');
          return res.redirect('/profile');
      }
    }
    

		if(typeof req.body.city=='undefined' || city==''){
			req.flash('error', 'City is required');
			 return res.redirect('/profile');
		}
		if(typeof req.body.state=='undefined' ||state==''){
			req.flash('error', 'State is required');
			 return res.redirect('/profile');
		}
		if(typeof req.body.zip=='undefined' || zip==''){
			req.flash('error', 'Zipcode is required');
			 return res.redirect('/profile');
		}
		if(typeof req.body.country=='undefined' || req.body.country.trim()==''){
			req.flash('error', 'Country is required');
			 return res.redirect('/profile');
		}
		
		//End :: validation
	
	User.findOne({referralcode: referred_code }, (err, referred_data) => {
      var referralby='';
      var referredbyemail='';
      if((typeof referred_data=='undefined' || err || referred_data==null) && referred_code!=0){
          req.flash('error', 'Invalid referral code!');
          return res.redirect('/profile');
      }
	  else if(referred_data!=null && referred_data.id==sess.user["_id"] && referred_code!=0){
		req.flash('error', 'Sorry, You can not use your own referral code.');
		return res.redirect('/profile');
	  }else {
        if(typeof referred_data != 'undefined' && referred_data!=null){
          if(typeof referred_data.id!='undefined' && referred_data.id!=''){
            referralby      = referred_data.id;

            if(typeof referred_data.email!='undefined' && referred_data.email!=''){
              referredbyemail =  referred_data.email;
            }
          }
        }
		  

      var firstname   = req.body.firstname.trim();
      var lastname    = req.body.lastname.trim();
      var address1    = req.body.address1.trim();
      var city        = req.body.city.trim();
      var state       = req.body.state.trim();
      var zip         = req.body.zip.trim();
      var country     = req.body.country.trim();

         // console.log(sess.user);
         //var params = {userid: req.session.user["_id"]};
          User.findById(req.session.user["_id"], (err, user) => {
                user["firstname"]   = firstname;
                user["lastname"]    = lastname;
                user["address1"]    = address1;
                user["address2"]    = address2;
                user["city"]        = city;
                user["state"]       = state;

                //for kyc update flag
               var check_identity=0;
               var is_second_identity=0;
               var is_both_identity=0;
               var verify_email=0;
      			   var verify_address=0;
      			   var verify_kyc_upload=0;

               if(typeof user!='undefined'){
                  if(typeof user.email!='undefined' && user.email!=''){
                    if(typeof user.is_verify_email!='undefined' && user.is_verify_email==1){
                      verify_email=1;
                    }
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
                  }else if(typeof req.body.address1!='undefined' && req.body.address1.trim()==''){
					           verify_address=1;
				          }

                  if((check_identity==1 && is_both_identity==1) || (check_identity==1 && is_second_identity==1) || (check_identity==1 && is_both_identity==1 && is_second_identity==1)){
                    verify_kyc_upload=1;
                  }
				  
                  if(verify_email==1 && verify_address==1 && verify_kyc_upload==1){
                    user["KYCUploaded"] =  "Yes";
                  }else{
                    user["KYCUploaded"] =  "No";
                  }
				        }

                if(referralby!=''){
                  user["referralby"] =  referralby;
                }
                if(referredbyemail!=''){
                  user["referralbyemail"] = referredbyemail;
                }

                user["country"] = country;
                user["zip"] = zip;
                user["phone"] = req.body.phone;
                user['updated_at']=Date.now();

                var currency = "USD";
                 if (req.body.country == "Korea, Republic of") {
                      currency = "KRW"
                 }
                 user["currency"]  = currency;
                                                  
                sess.user = user;
              
              user.save((err, usr) => {
                if (err) { console.log(err); throw err.message;}

                req.flash('success', 'Data Saved successfully');
                return res.redirect('/profile');
                });
            });
          }
      });
   }
})

app.get('/kyc', function(req, res){

       sess = req.session;
      
      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
            res.render('wizard_stepy', {
                layout: false,
                message: false,
                user: req.session.user,
                name: req.session.user.firstname + " " + req.session.user.lastname,
                firstname: req.session.user.firstname,
                lastname: req.session.user.lastname,
                email: req.session.user.email,
                address: req.session.user.address,
                city: req.session.user.city,
                country: req.session.user.country,
                file : req.session.user.file,
                doc_type1 : req.session.user.doc_type1,
                doc_type2 : req.session.user.doc_type2,
                docnumber2 : req.session.user.doc_type2,
                docnumber1 : req.session.user.docnumber1
            });
       }     
});

//new upload file function
app.post('/ResidenceUploadDocs',uploads.any(), function (req, res) {
    sess = req.session;
    if (funcs.isEmpty(req.files[0])){
      req.flash('error', 'No file selected in KYC, please try again...');
      return res.redirect('/profile');
    }

    var allowedTypes = ['image/png', 'image/jpg', 'image/jpeg',"image/gif","application/pdf"]
    var extension = req.files[0].mimetype;

    if (allowedTypes.indexOf(extension) === -1) {
        req.flash('error', 'Please select valid file format. Allowed formats: PNG,JPG,JPEG,PDF and GIF.');
        return res.redirect('/profile');
    }

    if (req.files[0].size>7340032) {
        req.flash('error', 'Maximum upload file size is 7MB only.');
        return res.redirect('/profile');
    }

    var si=req.files[0].filename;

    if(funcs.isEmpty(sess.user)) {
      res.redirect('/login');
    } else {
        User.findById(req.session.user["_id"], (err, user) => {
          user["docnumber2"] = 'PR00002';
          user["file3"] =si;
          user["doc_type2"] = 'Proof of Residence';

           //for kyc update flag
			var check_identity=0;
			var is_second_identity=1;
			var is_both_identity=0;
			var verify_email=0;
			var verify_address=0;
			var verify_kyc_upload=0;

          if(typeof user!='undefined'){
             if(typeof user.email!='undefined' && user.email!=''){
               if(typeof user.is_verify_email!='undefined' && user.is_verify_email==1){
                 verify_email=1;
               }
             }

             if(typeof user.file1!='undefined' && user.file1!=''){
               check_identity=1;
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
               user["KYCUploaded"] =  "Yes";
             }else{
              user["KYCUploaded"] =  "No";
             }
          }

          var currency = "USD";
           if (req.body.country == "Korea, Republic of") {
                currency = "KRW"
           } 
           user["currency"]  = currency;
           user['updated_at']=Date.now();   
          sess.user = user;

          user.save((err, usr) => {
            if (err) { console.log(err); throw err.message;}
              req.flash('success', 'Data Saved successfully');
              return res.redirect('/profile');
            });
        });
    } 
});

  //new upload file function
app.post('/IdentityUploadDocs',uploads.any(), function (req, res) {
    sess = req.session;
    var s2='';
    var si='';
    var is_both_identity='';
    var is_valid=0;
    if(typeof req.body.frontside_image_flag!='undefined' && req.body.frontside_image_flag==0){
        req.flash('error', 'No file selected in KYC, please try again...');
        return res.redirect('/profile');
    }

    if(req.body.frontside_image_flag==2 && req.body.backside_image_flag==2){
      si=req.files[0].filename;
      s2=req.files[1].filename;
      is_valid=2;
    }else if(req.body.frontside_image_flag==2 && req.body.backside_image_flag!=2){
      si=req.files[0].filename;
      is_valid=1;
    }else if(req.body.frontside_image_flag!=0 && req.body.backside_image_flag==2){
      s2=req.files[0].filename;
      is_valid=1;
    }

    // validation on file
    var allowedTypes = ['image/png', 'image/jpg', 'image/jpeg',"image/gif","application/pdf"]
    if(is_valid==1){
      var extension = req.files[0].mimetype;

      if (allowedTypes.indexOf(extension) === -1) {
          req.flash('error', 'Please select valid file format. Allowed formats: PNG,JPG,JPEG,PDF and GIF.');
          return res.redirect('/profile');
      }

      if (req.files[0].size>7340032) {
          req.flash('error', 'Maximum upload file size is 7MB only.');
          return res.redirect('/profile');
      }
    }else if(is_valid==2){
      var extension1 = req.files[0].mimetype;
      var extension2 = req.files[1].mimetype;

      if (allowedTypes.indexOf(extension1) === -1 || allowedTypes.indexOf(extension2) === -1) {
          req.flash('error', 'Please select valid file format.');
          return res.redirect('/profile');
      }
      
      if (req.files[0].size>7340032 || req.files[1].size>7340032) {
          req.flash('error', 'Maximum upload file size is 7MB only.');
          return res.redirect('/profile');
      }
    }

    if(funcs.isEmpty(sess.user)) {
      res.redirect('/login');
    } else {
      User.findById(req.session.user["_id"], (err, user) => {

        if(typeof req.body.frontside_image_flag!='undefined' && req.body.frontside_image_flag==2){
          user["file1"] = si;
        }
        if(typeof req.body.frontside_image_flag!='undefined' && req.body.backside_image_flag==2){
          user["file2"] = s2;
        }

         //for kyc update flag
		var check_identity=0;
		var is_second_identity=0;
		var is_both_identity=0;
		var verify_email=0;
		var verify_address=0;
		var verify_kyc_upload=0;

      if(typeof user!='undefined'){
  			if(typeof user.email!='undefined' && user.email!=''){
  				if(typeof user.is_verify_email!='undefined' && user.is_verify_email==1){
  					verify_email=1;
  				}
  			}

  			if(typeof si!='undefined' && si!=''){
  				check_identity=1;	
  			}
  			else if(typeof user.file1!='undefined' && typeof user.file1!=''){
  				check_identity=1;	
  			}
  			
  			if(typeof user.file3!='undefined' && user.file3!=''){
  				is_second_identity=1;
  			}
             
  			if(typeof req.body.is_both_identity!='undefined' && req.body.is_both_identity==1){
  				is_both_identity=1;
  			}

  			if(typeof user!='undefined' && typeof user.address1!='undefined' && user.address1.trim()!=''){
  				verify_address=1;
  			}

  			if((check_identity==1 && is_both_identity==1) || (check_identity==1 && is_second_identity==1) || (check_identity==1 && is_both_identity==1 && is_second_identity==1)){
               verify_kyc_upload=1;
  			}

  			if(verify_email==1 && verify_address==1 && verify_kyc_upload==1){
  				user["KYCUploaded"] =  "Yes";
  			}else{
  				user["KYCUploaded"] =  "No";
  			}
      }
        
        if(typeof req.body.is_both_identity!='undefined' && req.body.is_both_identity==1){
          user["is_both_identity"] = req.body.is_both_identity;
        }else{
          user["is_both_identity"] = 0;
        }

        user["docnumber1"] = 'PI00001';
          user["doc_type1"] = 'Proof of Identity';
          var currency = "USD";
           if (req.body.country == "Korea, Republic of") {
                currency = "KRW"
           } 
          user["currency"]  = currency;
          user['updated_at']=Date.now();
             
          sess.user = user;
          user.save((err, usr) => {
            if (err) { console.log(err); throw err.message;}

            req.flash('success', 'Data Saved successfully');
            return res.redirect('/profile');
          });
      });
    }
  });
}