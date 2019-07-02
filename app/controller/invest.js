const Order = require('../models/Order.js');
var funcs = require('../functions');

var config = require('config');

//Web3 = require('web3')
//web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host') +":"+ config.get('ethereum.port')));

//Web3 = require('web3')
//global.web3 = new Web3(new Web3.providers.HttpProvider("http://18.196.131.108:8545"));


const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': config.get("paypal.mode"),
    'client_id':  config.get("paypal.client_id"),
    'client_secret': config.get("paypal.client_secret")
  });

const stripe = require("stripe")(config.get("stripe.secret"));

//

module.exports = function(app){


app.get('/invest', function(req, res){
      sess = req.session;
      address = sess.address;  
      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
                // console.log("Admin address... :", config.get('ethereum.adminAddress'));
                // ethBalanceAdmin = parseFloat(web3.eth.getBalance(config.get('ethereum.adminAddress')))
                //console.log("Admin address ETH balance --", ethBalanceAdmin)

                var ethBalanceAdmin = 2*1e18;
                if(  ethBalanceAdmin > 1*1e18)
                {

                        res.render('invest', {
                            pageTitle: 'Welcome - ',
                            message: false,
                            walletmsg: '',
                            tokenDetails: '',
                            sidebar : false,
                            layout: false,
                            newwallet: config.get("ethereum.newwallet"),
                            name: req.session.user.firstname + " " + req.session.user.lastname 
                });
                 } else {  // else there is no eth balance for txn processing
                     res.render('message', {
                            pageTitle: 'Welcome ',
                            message: true,
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

    } //session
});



app.post('/invest', function(req, res){

     sess = req.session;

      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
            console.log(req.body);
            // save order details... 
                if (req.body.coin == "Paypal")
                {
                 orderData = {
                        orderdate: new Date(),
                        userid:     req.session.user["_id"],
                        firstname:  req.session.user.firstname,
                        lastname:   req.session.user.lastname,
                        email:      req.session.user.email,
                        amount:     req.body.amount,
                        ethaddress: req.body.ethaddress, 
                        currency:   config.get("currency"),
                        paymenttype:req.body.level0,
                        paymentstatus: "Waiting",
                        ether: parseFloat(req.body.amount) / ethToUSD,
                        coinname:req.body.coin
                    }


                            console.log("Paypal charge is called...");
                            console.log("return url..", config.get("paypal.return_url"));
                            console.log("Cancel url..", config.get("paypal.cancel_url"));
                            
                            var payment = {
                                "intent": "authorize",
                                "payer": {
                                    "payment_method": "paypal"
                                },
                                "redirect_urls": {
                                    "return_url": config.get("paypal.return_url"),
                                    "cancel_url": config.get("paypal.cancel_url")
                                },
                                "transactions": [{
                                    "amount": {
                                        "total": parseFloat(req.body.amount),
                                        "currency": config.get("currency")
                                    },
                                    "description": "LMICO Token order "
                                }]
                            };

                           // console.log("Payment....", payment);

                            paypal.payment.create(payment, function (error, payment) {
                                if (error) {
                                    console.log("Payment create err..");
                                    console.log(error);
                                    res.status(500).send(error);
                                } else {

                                  orderData.paymentreference = payment.id
                                  console.log(orderData);
                                  //":"PAY-0JF20961T2111433VLJXAKYA"  
                                       const newOrder = new Order(orderData);
                                       newOrder.save((err, order) => {
                                        if (err) { console.log(err); throw err.message;}

                                                console.log("Paypal create no error...");
                                                console.log("===payapl response ====", JSON.stringify(payment));
                                                
                                                if (payment.payer.payment_method === 'paypal') {
                                             
                                         
                                                    for (var i = 0; i < payment.links.length; i++) {
                                                        console.log(payment.links[i].rel);

                                                        if (payment.links[i].rel == "approval_url") {
                                                            console.log("Redirecting to... ", payment.links[i].rel);
                                                            res.redirect(payment.links[i].href);
                                                        }
                                                    }
                                                }
                                        }); // order save
                                    }  // if error create payment
                            }); // paypal payment create 

                }
                if (req.body.level0 == "Crypto")
                {
                        var amount = parseFloat(req.body.amount);
                        var Coinpayments = require('coinpayments');

                        options = {
                            key : config.get("coinpayments.key"),
                            secret : config.get("coinpayments.secret")
                            }
                        
                        var client = new Coinpayments(options);
                        console.log("Coinpayments charge is called...");
                        console.log("coin..", req.body.coin)
                        console.log("Requesting coin payment to create a payment transaction..");
                        client.createTransaction({'currency1' : 'ETH', 'currency2' :req.body.coin, 'amount' : parseFloat(req.body.amount) / ethToUSD },function(err,txnResponse){
                              if(err){
                                    console.log("Coinpayments create transaction error...", err);
                                    res.status(500).send(err);
                               }
                               console.log("txnResponse.....", txnResponse);
                               
                                orderData = {
                                    orderdate      : new Date(),
                                    userid         : req.session.user["_id"],
                                    firstname      : req.session.user.firstname,
                                    lastname       : req.session.user.lastname,
                                    email          : req.session.user.email,
                                    ethaddress     : req.body.ethaddress, 
                                    amount         : req.body.amount,
                                    currency       : config.get("currency"),
                                    paymenttype    : req.body.level0,
                                    paymentstatus  :  "Waiting",
                                    ether          : parseFloat(req.body.amount) / ethToUSD,
                                    coinname       : req.body.coin,
                                    paymentreference: txnResponse.txn_id,
                                    paymentaddress  : txnResponse.address,
                                    coinamount      : txnResponse.amount,
                                    paymentstatusurl: txnResponse.status_url,
                                }
                                const newOrder = new Order(orderData);
                                newOrder.save((err, order) => {

                                        if (err) {
                                            console.log("Order save error", err);
                                            res.status(500).send(err);
                                        } else {
                                             console.log("Payment transaction created...", txnResponse.txn_id);
                                             res.render('message', {
                                                    pageTitle: 'Welcome - ',
                                                    message: true,
                                                    tokenDetails: '',
                                                    sidebar : false,
                                                    message: true,
                                                    walletmsg: txnResponse.status_url,
                                                    address: "",
                                                    recordlink: "xxx",
                                                    coin: "Crypto",
                                                    name: req.session.user.firstname + " " + req.session.user.lastname 

                                            }); // render
                                        } //else 
                                 }); //save 
                            }); // transaction..
                } // if crypto payments... 
    } // if session
});



app.get('/paypal_success', function(req, res){
      console.log("payment success..")

          const payerId = req.query.PayerID;
          const paymentId = req.query.paymentId;

  Order.findOne({ paymentreference: paymentId }, (err, order) => {

          const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": order.currency,
                    "total": order.amount
                }
            }]
          };

          paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
  
                console.log(JSON.stringify(payment));
                if (config.get('ethereum.transaction') == "1"){
                  // payment success, place order in blockchain...
                      smartContract.buyTokensManual.sendTransaction(order.ethaddress,  order.ether * 1e18, {
                                  from: config.get('ethereum.adminAddress'),
                                  gas: config.get('ethereum.gas'),
                                  gasPrice: config.get('ethereum.gasPrice')
                              }, function (error, txnno) {
                                  if (error) {
                                      console.error(error)
                                  } else {
                                      console.log("Send transaction successful " + txnno)

                                     order.txnnumber = txnno;
                                     order.paymentstatus = "Received";

                                     order.save((err, order1) => {

                                       if( config.get('mailchimp.enabled') == "1") {  
                                               var request = require('superagent');
                                               var mailchimpInstance             = config.get('mailchimp.mailchimpInstance'); //'us17',
                                               var listUniqueId                   = config.get('mailchimp.listUniqueId');  // '4a4c2a0f58',
                                               var listUniqueIdPendingPayment     = config.get('mailchimp.listUniqueIdPendingPayment');   //'adc1834d485062b3f3e4355c1c8e4b75-us17';
                                                var mailchimpApiKey     = config.get('mailchimp.mailchimpApiKey'); 

                                                 var emailAddress = req.session.user.email.toLowerCase()   
                                                 hash = require('crypto').createHash('md5').update(emailAddress).digest('hex'),
                                                 request.delete('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueIdPendingPayment + '/members/'+hash).set('Content-Type', 'application/json;charset=utf-8').set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64')).send({'status': 'unsubscribe'}).end(function(err, response) {
                                                  if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
                                                      console.log('Removed address from Pending mail list......');
                                                   
                                                  } else {
                                                    console.log('Remove failed...from the Pending mail list.. :(', err);
                                              
                                                  }
                                              });  // request

                                               var sleep = require('system-sleep');
                                               sleep(2000); // sleep 3 secs
                                            }; // mailchimp enabled


                                               res.render('message', {
                                                      pageTitle: 'Welcome - ',
                                                      message: true,
                                                      tokenDetails: '',
                                                      sidebar : false,
                                                      message: true,
                                                      walletmsg: txnno,
                                                      address: "",
                                                      recordlink: "xxx",
                                                      coin: "Paypal",
                                                      name: req.session.user.firstname + " " + req.session.user.lastname 
       
                                              });
                                      }) // order save 
                                 }  // send successful..
                      }); // sendTransaction      
                } else {
                                      txnno = ""
                                     order.txnnumber = txnno;
                                     order.paymentstatus = "Received";

                                     order.save((err, order1) => {

                                              res.render('message', {
                                                      pageTitle: 'Welcome - ',
                                                      message: true,
                                                      tokenDetails: '',
                                                      sidebar : false,
                                                      message: true,
                                                      walletmsg: txnno,
                                                      address: "",
                                                      recordlink: "xxx",
                                                      coin: "Paypal",

                                                      name: req.session.user.firstname + " " + req.session.user.lastname 
       
                                              });
                                      }) // order save 

                }; // manual - auto blockchain transaction
            }
        }); // paypal.payment.execute
    }); // findOne Order
});



app.get('/paypal_failed', function(req, res){
    console.log("payment failed..")
   res.send('failed..');
});


// stripe payment...


app.post("/charge/:orderid", (req, res) => {
    console.log("req.paramsss...", req.params.orderid);
    Order.findById(req.params.orderid, (err, order) => {

            var amount = order.amount * 100;
            var emailAddress = order.email;

           console.log("Stripe payment ...");

            stripe.customers.create({
              email: req.body.email,
              card: req.body.id
            })
            .then(customer =>
              stripe.charges.create({
                amount,
                description: "Sample Charge",
                currency: config.get("currency"),
                customer: customer.id
              }))
            .then(charge => {
                 console.log("Charge response...", charge);
                        order.paymentreference = charge.id
                        order.paymentmessage = charge.status;
                        order.paymentstatus = "Received";
                      

                        order.save((err, order1) => { 

                        if( config.get('mailchimp.enabled') == "1") {  
                             var request = require('superagent');
                             var mailchimpInstance             = config.get('mailchimp.mailchimpInstance'); //'us17',
                             var listUniqueId                   = config.get('mailchimp.listUniqueId');  // '4a4c2a0f58',
                             var listUniqueIdPendingPayment     = config.get('mailchimp.listUniqueIdPendingPayment');   //'adc1834d485062b3f3e4355c1c8e4b75-us17';
                             var mailchimpApiKey     = config.get('mailchimp.mailchimpApiKey');   //'adc1834d485062b3f3e4355c1c8e4b75-us17';

                               console.log("Session...", req.session.user);
                                console.log("Email.....", emailAddress);
                          
                               var emailAddressLowerCase = emailAddress.toLowerCase()   
                               hash = require('crypto').createHash('md5').update(emailAddressLowerCase).digest('hex'),
                               request.delete('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueIdPendingPayment + '/members/'+hash).set('Content-Type', 'application/json;charset=utf-8').set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64')).send({'status': 'unsubscribe'}).end(function(err, response) {
                                if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
                                    console.log('Removed address from Pending mail list......');
                                 
                                } else {
                                  console.log('Remove failed...from the Pending mail list.. :(', err);
                            
                                }
                            });  // request

                         var sleep = require('system-sleep');
                         sleep(2000); // sleep 3 secs
                          }
                          res.send(charge);                                       
                      });
            })
            .catch(err => {
                      console.log("Error:", err);
                      res.status(500).send({error: "Purchase Failed"});
                    });
        }); // order find..
  });
//

} // module.exports