
const OrderNew = require('../models/OrderNew.js');
const Order = require('../models/Order.js');
const Wallet = require('../models/Wallet.js');

const User = require('../models/User.js');

var funcs = require('../functions');
var config = require('config');

 Web3 = require('web3')
 //web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/4vsHVZygsQz7d5rxTVqG"));

web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host')));


var contract = JSON.parse(require('fs').readFileSync(config.get('ethereum.contractFile'), 'utf8'));                                                   
global.smartContract = web3.eth.contract(contract.abi).at(contract.networks[config.get('ethereum.network')].address);
global.abiDefinition =  contract.abi;
global.contractAddress = contract.networks[config.get('ethereum.network')].address;

 //web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host') +":"+ config.get('ethereum.port')));

//Web3 = require('web3')
//global.web3 = new Web3(new Web3.providers.HttpProvider("http://18.196.131.108:8545"));
//
module.exports = function(app){

//
//


app.get('/purchase', function(req, res){
      sess = req.session;
      address = sess.address;  
      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
		   
				var uid= req.session.user["_id"];
				var mongoose = require('mongoose');
				var userID = new mongoose.Types.ObjectId(uid);
			
                // console.log("Admin address... :", config.get('ethereum.adminAddress'));
                // ethBalanceAdmin = parseFloat(web3.eth.getBalance(config.get('ethereum.adminAddress')))
                //console.log("Admin address ETH balance --", ethBalanceAdmin)
				
			User.findOne({_id:userID}, (err, userData) => {
				if(err){
				  console.log(JSON.stringify(err));
				  res.redirect('/login');
				}else {
			if (typeof userData.status!='undefined' && userData.status == "ACTIVE") {
                        var ethBalanceAdmin = 2*1e18;
                        if(  ethBalanceAdmin > 1*1e18)
                        {
                          var btc = 0.0001;
                          var eth = 0.001;
                          var ltc = 0.01;

                          var request = require("request");

                          console.log("User currency..:", userData.currency);
                          console.log("Conversion required for...", config.get("general.currencyConversion") );

                          var currency = "USD";
						
                          if (!funcs.isEmpty(userData.currency)) {
                                var currency = userData.currency;
                          }
                          var defaultEth = config.get('ethereum.defaultPrice');
                          var defaultBTC = config.get('bitcoin.defaultPrice');

                          var url = "https://min-api.cryptocompare.com/data/price?fsym="+currency+"&tsyms="+config.get("general.currencyConversion");
                          console.log(url);
                          
                          //"https://min-api.cryptocompare.com/data/price?fsym=KRW&tsyms=LTC,ETH,BTC,DASH"
                          request(url, function(error, response, body) {
                                  console.log("body :", body);
                                  if (body){
                                      body = JSON.parse(body);  
                                      eth = parseFloat(1/body["ETH"]) > defaultEth ? parseFloat(1/body["ETH"]) : defaultEth;
                                      btc = parseFloat(1/body["BTC"]) > defaultBTC ? parseFloat(1/body["BTC"]) : defaultBTC;
                                      btc = btc.toFixed(4).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                                      eth = eth.toFixed(4).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                                  }       

                                res.render('invest2', {
                                    pageTitle: 'Welcome - ',
                                    message: false,
                                    walletmsg: '',
                                    tokenDetails: '',
                                    sidebar : false,
                                    layout: false,
                                    btc: btc,
                                    eth: eth,
                                    ltc: ltc,
                                    newwallet: config.get("ethereum.newwallet"),
                                    name: userData.firstname + " " + userData.lastname,
                                    usercurrency: userData.currency,
									userInfo:userData
                                  });
                              });

                         } else {  // else there is no eth balance for txn processing
                             res.render('message', {
                                    pageTitle: 'Welcome ',
                                    message: true,
                                    tokenDetails: '',
                                    sidebar : false,
                                    message: true,
                                    layout: false,
                                    walletmsg: "Transactions will not go through blockchain as the balance of tha admin address is very less, please contract your system administrator",
                                    address: "",
                                    recordlink: "xxx",
                                    coin: "Crypto",
                                    name: userData.firstname + " " + userData.lastname,
						userInfo:userData
                                });
                        } //if eth balance for txn processing is less than 1 ETH
                      } else {   // if the account is not active

						 res.render('message', {
								pageTitle: 'Welcome ',
								message: true,
								tokenDetails: '',
								sidebar : false,
								message: true,
								walletmsg: "Thank you very much for your interest. Please complete the KYC requirements at My Profile -> KYC for purchasing LYNK Coins",
								address: "",
                                                recordlink: "",
                                                layout: false,
								coin: "Crypto",
								name: userData.firstname + " " + userData.lastname,
								userInfo:userData
							});
						}
					}
				});
		} //session
	});



app.get('/invest2', function(req, res){
      sess = req.session;
      address = sess.address;  
      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
                // console.log("Admin address... :", config.get('ethereum.adminAddress'));
                // ethBalanceAdmin = parseFloat(web3.eth.getBalance(config.get('ethereum.adminAddress')))
                //console.log("Admin address ETH balance --", ethBalanceAdmin)

                if (req.session.user.status == "ACTIVE") {
                        var ethBalanceAdmin = 2*1e18;
                        if(  ethBalanceAdmin > 1*1e18)
                        {
                          var btc = 0.0001;
                          var eth = 0.001;
                          var ltc = 0.01;

                          var request = require("request");

                          console.log("User currency..:", req.session.user.currency);
                          console.log("Conversion required for...", config.get("general.currencyConversion") );

                          var currency = "USD";

                          if (!funcs.isEmpty(req.session.user.currency)) {
                                var currency = req.session.user.currency;
                          }

                          var defaultEth = config.get('ethereum.defaultPrice');
                          var defaultBTC = config.get('bitcoin.defaultPrice');
                          var url = "https://min-api.cryptocompare.com/data/price?fsym="+currency+"&tsyms="+config.get("general.currencyConversion");
                          console.log(url);
                          
                          //"https://min-api.cryptocompare.com/data/price?fsym=KRW&tsyms=LTC,ETH,BTC,DASH"
                          request(url, function(error, response, body) {
                                  console.log("body :", body);
                                  if (body){
                                      body = JSON.parse(body);  
                                      eth = parseFloat(1/body["ETH"]) > defaultEth ? parseFloat(1/body["ETH"]) : defaultEth;
                                      btc = parseFloat(1/body["BTC"]) > defaultBTC ? parseFloat(1/body["BTC"]) : defaultBTC;
                                      btc = btc.toFixed(4).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                                      eth = eth.toFixed(4).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                                  }       

                                res.render('invest2', {
                                    pageTitle: 'Welcome - ',
                                    message: false,
                                    walletmsg: '',
                                    tokenDetails: '',
                                    sidebar : false,
                                    layout: false,
                                    btc: btc,
                                    eth: eth,
                                    ltc: ltc,
                                    newwallet: config.get("ethereum.newwallet"),
                                    name: req.session.user.firstname + " " + req.session.user.lastname,
                                    usercurrency: req.session.user.currency
                                  });
                              });

                         } else {  // else there is no eth balance for txn processing
                             res.render('message', {
                                    pageTitle: 'Welcome ',
                                    message: true,
                                    layout: false,
                                    tokenDetails: '',
                                    sidebar : false,
                                    message: true,
                                    walletmsg: "Transactions will not go through blockchain as the balance of tha admin address is very less, please contract your system administrator",
                                    address: "",
                                    recordlink: "xxx",
                                    coin: "Crypto",
                                    name: req.session.user.firstname + " " + req.session.user.lastname 
                                });
                        } //if eth balance for txn processing is less than 1 ETH
                      } else {   // if the active is not active

                             res.render('message', {
                                    pageTitle: 'Welcome ',
                                    layout: false,
                                    message: true,
                                    tokenDetails: '1',
                                    sidebar : false,
                                    message: true,
                                    walletmsg: "Thank you very much for your interest. We are verifying your details and will confirm you shortly, please wait or contract the administrator",
                                    address: "2",
                                    recordlink: "3",
                                    coin: "Crypto",
                                    name: req.session.user.firstname + " " + req.session.user.lastname 
                                });


             }

    } //session
});


//
//  create order new one wallet for every user...
//
//


app.post('/createOrderNew/:coin/:ethaddress', function(req, res){
  var qr= require('qr-image');
  sess = req.session;
  console.log("conversion....", ethToUSD);
  //console.log(("Ether....", parseFloat(req.params.amount)/100) / ethToUSD);

  console.log("Create order new ... req.params.coin", req.params.coin);
                       const Wallet = require('../models/Wallet.js');

                       params = {coin: req.params.coin, used:"No"}; 
                  //      params = {coin: req.params.coin,};
					   
					   //Order.findById(req.params.orderid, function(err, order) {
                       console.log ("Params...***********.", params);
                       let orderPaymentAddress;
                       Wallet.findOne(params, function (walleterr, wallet) { 
                            console.log(wallet);
                            console.log("wallet.publickey", wallet);
                            if(wallet){
                               orderPaymentAddress = wallet.publickey;
                            }else{
                              if (req.params.coin == "Ethereum"){
                                     orderPaymentAddress = config.get('ethereum.defaultwallet');
                              }
                              if (req.params.coin == "Bitcoin"){
                                     orderPaymentAddress = config.get('bitcoin.defaultwallet');
                              }
                            }
                            console.log("===========================");
                            orderData = {
                                      orderdate: new Date(),
                                      userid:     req.session.user["_id"],
                                      firstname:  req.session.user.firstname,
                                      lastname:   req.session.user.lastname,
                                      email:      req.session.user.email,
                                      currency:   config.get("currency"),
                                      paymentstatus: "Waiting",
                                      ethaddress     : req.params.ethaddress, 
                                      paymenttype    : req.params.coin,
                                      coinname       : req.params.coin
                                     // ether: (parseFloat(req.params.amount)/100) / ethToUSD,
                                     //paymentwallet: wallet.publickey
                                  }

                                  console.log("body...", req.body);
                                  console.log("params....", req.params);
                                  console.log("order data....", orderData);

                                 if (req.params.coin == "Ethereum") {
                                        if (!funcs.isEmpty(req.session.user["ethpaymentwallet"])) 
                                        {
                                              orderData["paymentwallet"] = req.session.user["ethpaymentwallet"];
                                              paymentwallet = req.session.user["ethpaymentwallet"];                                             
                                              if(wallet)
                                              wallet.used = "No";
                                              console.log("There is a payment wallet in user")
                                        } else {
                                              orderData["paymentwallet"] = orderPaymentAddress;
                                              paymentwallet = orderPaymentAddress;
                                              if(wallet) {
                                                wallet.used = "Yes";
                                                wallet.firstname = req.session.user.firstname;
                                                wallet.lastname = req.session.user.lastname;
                                                wallet.email = req.session.user.email;
                                              }                                           
                                              console.log("There is not payment wallet in user, taking a new one from wallet");
                                        }
                                   }
                                  if (req.params.coin == "Bitcoin") {
                                        if (!funcs.isEmpty(req.session.user["btcpaymentwallet"])) 
                                        {
                                              orderData["paymentwallet"] = req.session.user["btcpaymentwallet"];
                                              paymentwallet = req.session.user["btcpaymentwallet"];
                                              if(wallet)
                                              wallet.used = "No";
                                        } else 
                                        {
                                              orderData["paymentwallet"] = orderPaymentAddress;
                                              paymentwallet = orderPaymentAddress;
                                              if(wallet) {
                                                wallet.used = "Yes";   
                                                wallet.firstname = req.session.user.firstname;
                                                wallet.lastname = req.session.user.lastname;
                                                wallet.email = req.session.user.email;
                                              }
                                        }                                    
                                  }     

                                  console.log("")                 
                                  var newOrder = new OrderNew(orderData);
                                  newOrder.save((err, order) => {
                                  if (err) { console.log(err); throw err.message;}
                                         // if only one payment wallet to be shown..
                                          User.findById(req.session.user["_id"], (err, user) => {
                                                  if (funcs.isEmpty(req.session.user["ethpaymentwallet"]) || funcs.isEmpty(req.session.user["btcpaymentwallet"])) {
                                                      if (req.params.coin == "Ethereum") {
                                                            user["ethpaymentwallet"] = paymentwallet
                                                      }
                                                      if (req.params.coin == "Bitcoin")  {
                                                            user["btcpaymentwallet"] = paymentwallet
                                                      }

                                                        sess.user = user;

                                                           user.save((err, usr) => {
                                                            if (err) { console.log(err); throw err.message;}
                                                                    sess.user = user;
                                                                    if (req.params.coin == "Ethereum")
                                                                    {
                                                                           if (config.get("ethereum.uniquepaywallet") == "0"){
             
                                                                             var svg_string = qr.imageSync(config.get("ethereum.paymentwallet"),{ type: 'svg' });
             
                                                                                 res.json({address:req.params.coin + " Address : "+ config.get("ethereum.paymentwallet"),qr_code:svg_string});
                                                                           } else {
                                                                                  //wallet.used = "Yes";
                                                                                  if(wallet) {
                                                                                     wallet.save((err, updWallet) => {
                                                                                           //res.json(paymentwallet);
                                                                                           var svg_string = qr.imageSync(paymentwallet,{ type: 'svg' });
                                                                                           res.json({address:paymentwallet,qr_code:svg_string});
                                                                                        });
                                                                                  }else {
                                                                                     var svg_string = qr.imageSync(paymentwallet,{ type: 'svg' });
                                                                                     res.json({address:paymentwallet,qr_code:svg_string});
                                                                                  }
                                                                           }
                                                                     }  // ethereum
             
                                                                     if (req.params.coin == "Bitcoin")
                                                                     {
                                                                           if (config.get("bitcoin.uniquepaywallet") == "0"){
                                                                              var svg_string = qr.imageSync(config.get("bitcoin.paymentwallet"),{ type: 'svg' });
             
                                                                                 res.json({address:req.params.coin + " Address : "+ config.get("bitcoin.paymentwallet"),qr_code:svg_string});
                                                                           } else {
                                                                                  //wallet.used = "Yes";
                                                                                  if(wallet) {
                                                                                     wallet.save((err, updWallet) => {
                                                                                           //res.json(paymentwallet);
                                                                                           var svg_string = qr.imageSync(paymentwallet,{ type: 'svg' });
                                                                                           res.json({address:paymentwallet,qr_code:svg_string});
                                                                                        });
                                                                                  }else {
                                                                                     var svg_string = qr.imageSync(paymentwallet,{ type: 'svg' });
                                                                                     res.json({address:paymentwallet,qr_code:svg_string});
                                                                                  }
                                                                           }
                                                                     }  //bitcoin
                                                                    console.log("Updating the user record with payment wallet..")
                                                            }); //save
                                                       } // isempty
                                                       else {
                                                            if (req.params.coin == "Ethereum")
                                                            {
                                                                   if (config.get("ethereum.uniquepaywallet") == "0"){
     
                                                                     var svg_string = qr.imageSync(config.get("ethereum.paymentwallet"),{ type: 'svg' });
     
                                                                         res.json({address:req.params.coin + " Address : "+ config.get("ethereum.paymentwallet"),qr_code:svg_string});
                                                                   } else {
                                                                          //wallet.used = "Yes";
                                                                          if(wallet) {
                                                                             wallet.save((err, updWallet) => {
                                                                                   //res.json(paymentwallet);
                                                                                   var svg_string = qr.imageSync(paymentwallet,{ type: 'svg' });
                                                                                   res.json({address:paymentwallet,qr_code:svg_string});
                                                                                });
                                                                          }else {
                                                                             var svg_string = qr.imageSync(paymentwallet,{ type: 'svg' });
                                                                             res.json({address:paymentwallet,qr_code:svg_string});
                                                                          }
                                                                   }
                                                             }  // ethereum
     
                                                             if (req.params.coin == "Bitcoin")
                                                             {
                                                                   if (config.get("bitcoin.uniquepaywallet") == "0"){
                                                                      var svg_string = qr.imageSync(config.get("bitcoin.paymentwallet"),{ type: 'svg' });
     
                                                                         res.json({address:req.params.coin + " Address : "+ config.get("bitcoin.paymentwallet"),qr_code:svg_string});
                                                                   } else {
                                                                          //wallet.used = "Yes";
                                                                          if(wallet) {
                                                                             wallet.save((err, updWallet) => {
                                                                                   //res.json(paymentwallet);
                                                                                   var svg_string = qr.imageSync(paymentwallet,{ type: 'svg' });
                                                                                   res.json({address:paymentwallet,qr_code:svg_string});
                                                                                });
                                                                          }else {
                                                                             var svg_string = qr.imageSync(paymentwallet,{ type: 'svg' });
                                                                             res.json({address:paymentwallet,qr_code:svg_string});
                                                                          }
                                                                   }
                                                             }
                                                       }
                                               }); // user find
                                  }); // order save
                          }); // findWallet     
}); //app.post

//
//  create order new one wallet for every transaction...
//
//

app.post('/createOrderNew_2/:coin/:ethaddress', function(req, res){
  console.log("conversion....", ethToUSD);
  //console.log(("Ether....", parseFloat(req.params.amount)/100) / ethToUSD);

  console.log("Create order new ... req.params.coin", req.params.coin);


    // params = {coin: req.params.coin, $not: {used: "Yes"}}; 
     params = {coin: req.params.coin, used:"No"}; 
     //Order.findById(req.params.orderid, function(err, order) {
     Wallet.findOne(params, function (walleterr, wallet) { 
          console.log(wallet);
          orderData = {
                    orderdate: new Date(),
                    userid:     req.session.user["_id"],
                    firstname:  req.session.user.firstname,
                    lastname:   req.session.user.lastname,
                    email:      req.session.user.email,
                    amount:     "  " ,
                    ethaddress:  req.params.ethaddress, 
                    currency:   config.get("currency"),
                    paymenttype: req.params.coin,
                    paymentstatus: "Waiting",
                   // ether: (parseFloat(req.params.amount)/100) / ethToUSD,
                    coinname:req.params.coin,
                    paymentwallet: wallet.publickey
                   // tokens: req.params.tokens
                }
                const newOrder = new OrderNew(orderData);
                newOrder.save((err, order) => {
                if (err) { console.log(err); throw err.message;}
                       // if only one payment wallet to be shown..
                       if (req.params.coin == "Ethereum")
                       {
                                if (config.get("ethereum.uniquepaywallet") == "0"){
                                      res.json(req.params.coin + " Address : "+ config.get("ethereum.paymentwallet"));
                                } else {
                                       wallet.used = "Yes";
                                       wallet.save((err, updWallet) => {
                                             res.json(req.params.coin + " Address : "+ wallet.publickey);
                                       });
                                }
                        } 

                        if (req.params.coin == "Bitcoin")
                        {
                                if (config.get("bitcoin.uniquepaywallet") == "0"){
                                      res.json(req.params.coin + " Address : "+ config.get("bitcoin.paymentwallet"));
                                } else {
                                       wallet.used = "Yes";
                                       wallet.save((err, updWallet) => {
                                             res.json(req.params.coin + " Address : "+ wallet.publickey);
                                       });
                                }
                        } 
                }); // order save
        });
});
//
//
//
app.get('/userordersnew', function(req, res){

      sess = req.session;
      address = sess.address;  

      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
                console.log (" req.session.user[_id]...", req.session.user["_id"]);
                 var params = {userid: req.session.user["_id"]};
                 var orderDetails = [];
                //  params = {paymentstatus: 'Received'}; 
                  //params = {}; 
                  //
                  //Order.find(params).sort([['updated', -1]]).exec(function (err, orders) {                  
                  OrderNew.find(params).sort([['orderdate', 1]]).exec(function (err, orders) {
                    if (err) {
                        console.log(err);
                    }
                    // var orderHTML ='<table class="table datatable-button-html5-columns">';
                    //     orderHTML += '<thead><tr><th>TXN # </th><th>First Name</th><th>Last Name</th><th>Job Title</th><th>DOB</th><th>DOB</th><th>Status</th> <th>Salary</th> </tr></thead> <tbody>';

                    //     orders.forEach(function(order){
                    //             orderHTML += '<tr><td>' + order.fullname + '</td>'
                    //             orderHTML += '<td><a href="#">' + order.email +'</a></td>'
                    //             orderHTML += '<td>' + order.eth_address +'</td>'
                    //             orderHTML += '<td>' + order.updated + '</td>'
                    //             orderHTML += '<td> $' + order.amount + '</td>'
                    
                    //             if ( order.payment_type == "FIAT") {
                    //                 orderHTML += '<td><span class="label label-success">' + order.payment_type +'</span></td>';
                    //                 }
                    //             if ( order.payment_type == "PayPal") {
                    //                 orderHTML += '<td><span class="label label-info">' + order.payment_type +'</span></td>';
                    //             }
                    //             if ( order.payment_type == "Cryptocurrency") {
                    //                 orderHTML +=  '<td><span class="label label-danger">' + order.payment_type +'</span></td>'
                    //                 } 
                    //                 orderHTML += '<td>' + order.tokens +'</td>'
                    //     });
                    //     orderHTML += '</tr></tbody></table>'


                            // var alasql = require('alasql');
                            // var subTotal = alasql('SELECT paymenttype, sum(CAST(amount as float)) AS amount FROM ? GROUP BY paymenttype', [orders]);
                            // var totalraised = alasql('SELECT sum(CAST(amount as float)) AS amount FROM ? ', [orders]);
                            // //CAST('7082.7758172' as float)

                            // var paypalTotal = 0;
                            // var fiatTotal = 0;
                            // var cryptoTotal = 0;
                            // var bankTotal = 0;
                            // var othersTotal = 0;


                            // for (i = 0; i < subTotal.length; i++) {
                            //     switch (subTotal[i].paymenttype) {
                            //         case "Paypal":
                            //             paypalTotal = subTotal[i].amount;
                            //             break;
                            //         case "Credit Card":
                            //             fiatTotal = subTotal[i].amount;
                            //             break;
                            //         case "Bank Wire":
                            //             bankTotal = subTotal[i].amount;
                            //             break;

                            //         case "Crypto":
                            //             cryptoTotal = subTotal[i].amount;
                            //             break;
                            //     }
                            // }





                            res.render('orders_users_new', {
                                     orders : orders,
                                     layout: false,
                                     name: req.session.user.firstname + " " + req.session.user.lastname, 
                                     // paypalTotal: parseFloat(paypalTotal).toFixed(2),
                                     // fiatTotal: parseFloat(fiatTotal).toFixed(2),
                                     // cryptoTotal: parseFloat(cryptoTotal).toFixed(2), 
                                     profile_image_url: ""
                                     // bankTotal: parseFloat(bankTotal).toFixed(2), 
                                     // othersTotal: parseFloat(othersTotal).toFixed(2), 
                                     // orderTotal: parseFloat(totalraised[0].amount).toFixed(2)
                                    //messages: messages
                        });
                });
     } // else
});
//


app.post('/updatePaymentNew/:orderid', function(req, res){

"use strict";

console.log("Update Payment : Order id...", req.params.orderid);


  try { 

          OrderNew.findById(req.params.orderid, (err, order) => {
                if (err) {
                   console.log("Order not found...");
                   throw err;
                } else {

                   console.log("Order found...", order);

                   if (order.paymenttype == "Ethereum") {
                        
                        Web3 = require('web3')
                        web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host')));

                     
                        web3.eth.getBalance(order.paymentwallet, function(err, balance) {
                            if (err) {
                              console.log("Error in blockchain query.. ", err);
                              throw err;
                            } 
                            console.log("Wallet : ",order.paymentwallet);
                           
                            var walletBalance = balance/1e18;
                            console.log("balance ", walletBalance);
                
                            // Save the updated document back to the database
                                if (walletBalance > 0)
                                {
                                    order.amount = walletBalance;
                                    order.paymentstatus = "Received";
                                    order.conversion = ethToUSD;
                                    order.amountinusd  =  parseFloat(walletBalance) * parseFloat(ethToUSD);

                                    var dateNow = new Date();

                                    order.paymentdate = dateNow;

                                    var moment = require('moment-timezone');
                                    datePrice = moment.tz(dateNow, "Asia/Seoul").format('DD-MMM-YYYY')

                                    console.log("==================")
                                    console.log("date for price...", datePrice)

                                    var prices = config.get('prices');
                                    var tokenPrice = 0;

                                    if(funcs.isEmpty(prices[datePrice]))
                                    {
                                          tokenPrice  =  parseFloat(prices["default"].Price);  

                                    }else {
                                          tokenPrice  =  parseFloat(prices[datePrice].Price);  

                                    }
    
                                    console.log("==================")
                                    console.log("price for now...", tokenPrice);

                                    var tokens =  (parseFloat(walletBalance) * parseFloat(ethToUSD)) / parseFloat(tokenPrice);

                                    console.log("tokens...", tokens);

                                    order.tokens = tokens;
                                    order.tokenstransferred = 0;

                                    order.save((err, ord1) => {
                                        if (err) {
                                            res.status(500).send(err)
                                          } else {
                                            console.log( order.id +" Order refreshed");
                                            // update the order tokens 
                                            //

                                             res.json("Updated..");
                                          }
                                    });  // order save

                                  } else {
                                       console.log( " Balance is zero");
                                       res.json("Amoutn not Received..");
                                  }
              
                                });      // ether get balance 
                            } else {
                                    // bitcoin balance check..
                                   if (order.paymenttype == "Bitcoin") {
                                    var request = require("request");
                                    var balance =0
                                    console.log("Bitcoin payment Wallet : ",order.paymentwallet);
                                    //var url = "https://api.blockcypher.com/v1/btc/main/addrs/" + order.paymentwallet + "/balance"
                                    var url = config.get('bitcoin.host') + order.paymentwallet + "/balance"
                                    request(url, function(error, response, body) {
                                          console.log("body... ",  body);
                                          result = JSON.parse(body)
                                          walletBalance = parseFloat(result.balance)  / 1e8;
                                          console.log("btc... ",  walletBalance);
                                          if (walletBalance > 0)
                                                {
                                                    order.amount = walletBalance;
                                                    order.paymentstatus = "Received";
                                                    order.conversion = btcToUSD;
                                                    order.amountinusd  =  parseFloat(walletBalance) * parseFloat(btcToUSD);

                                                    var dateNow = new Date();

                                                    order.paymentdate = dateNow;

                                                    var moment = require('moment-timezone');
                                                    datePrice = moment.tz(dateNow, "Asia/Seoul").format('DD-MMM-YYYY')




                                                    console.log("==================")


                                                    console.log("date for price...", datePrice)

                                                    var prices = config.get('prices');
                                                    var tokenPrice = 0;

                                                    if(funcs.isEmpty(prices[datePrice]))
                                                    {
                                                          tokenPrice  =  parseFloat(prices["default"].Price);  

                                                    }else {
                                                          tokenPrice  =  parseFloat(prices[datePrice].Price);  

                                                    }
                      
                                                    console.log("==================")
                                                    console.log("price for now...", tokenPrice);
                                                    var tokens =  (parseFloat(walletBalance) * parseFloat(btcToUSD)) / parseFloat(tokenPrice);

                                                    console.log("tokens...", tokens);

                                                    order.tokens = tokens;
                                                    order.tokenstransferred = 0;

                                                    order.save((err, ord1) => {
                                                        if (err) {
                                                            res.status(500).send(err)
                                                          } else {
                                                            console.log( order.id +" Order refreshed");
                                                            // update the order tokens 
                                                             res.json("Updated..");
                                                          }
                                                    });  // order save

                                                  } else {
                                                       console.log( " Balance is zero");
                                                       res.json("Amount not Received..");
                                            }
                                     });      // request btc balance
                            }
                       } // bitcoin
                   } // else foundOrder
            }); // order find...
    
   } catch (err) { 
       console.log("catch error", err) 
   } finally {
        console.log("finally ...  catch error") 
    }
}); // app.post


} // module.exports