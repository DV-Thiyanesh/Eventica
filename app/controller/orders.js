
//const Order = require('../models/Order.js');
const Order = require('../models/OrderNew.js');
const Wallet = require('../models/Wallet.js');
const User = require('../models/User.js');

var funcs = require('../functions');
var config = require('config');

Web3 = require('web3')
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
// create an order
//
app.post('/createOrder/:coin/:amount/:ethaddress/:tokens', function(req, res){
  console.log("conversion....", ethToUSD);
  console.log(("Ether....", parseFloat(req.params.amount)/100) / ethToUSD);

        orderData = {
                  orderdate: new Date(),
                  userid:     req.session.user["_id"],
                  firstname:  req.session.user.firstname,
                  lastname:   req.session.user.lastname,
                  email:      req.session.user.email,
                  amount:     parseFloat(req.params.amount) / 100 ,
                  ethaddress:  req.params.ethaddress, 
                  currency:   config.get("currency"),
                  paymenttype:req.params.coin,
                  paymentstatus: "Waiting",
                  ether: (parseFloat(req.params.amount)/100) / ethToUSD,
                  coinname:req.params.coin,
                  tokens: req.params.tokens
              }

              const newOrder = new Order(orderData);
              newOrder.save((err, order) => {
              if (err) { console.log(err); throw err.message;}

                      res.json(order);
              }); // order save
});
//
//
// Remove an order 
//

app.post('/removeOrder/:orderid', function(req, res){

	    console.log("Remove...", req.params.orderid.trim());
		Order.findById(req.params.orderid, function(err, order) {
		    if (err) {
		    	   console.log(err);
		           return res.json({status:'Error',msg:'Something went wrong, Please try again.'});
            }
            else if(!order){
                return res.json({status:'Error',msg:'Sorry, Order data not found.'});
            }
		    else {
 		   	    console.log(order)
		    	order.remove((err, result) => {
                    console.log("Removed..");
                    
                    res.json({status:'OK',msg:'Order removed successfully'});

		    	});
		    }
		});
});

//
// create blockchain transation 
//
app.post("/createtxn/:orderid", (req, res) => {
      if (config.get('ethereum.transaction') == "1"){
            Order.findById(req.params.orderid, (err, order) => {

              Web3 = require('web3')
              //web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/4vsHVZygsQz7d5rxTVqG"));
              web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host')));

              var contract = JSON.parse(require('fs').readFileSync(config.get('ethereum.contractFile'), 'utf8'));                                                   
              var smartContract = web3.eth.contract(contract.abi).at(contract.networks[config.get('ethereum.network')].address);

              console.log("Found order....");

              var adminAddress =  config.get('ethereum.adminAddress');          

              console.log("Found order....0. getTransactionCount",  web3.eth.getTransactionCount(adminAddress));

              var privateKey = "4f7a2f30c7fbd017ffc1e70379eb42cf3f8ac28abed3fcb7d754485f39514d9e";

              var Tx = require('ethereumjs-tx');
              var privKey = new Buffer(privateKey, 'hex');

              console.log("Found order.....1. privKey", privKey);

                    var rawTransaction = 
                              {  
                                          "nonce":web3.toHex(web3.eth.getTransactionCount(adminAddress)),
                                          "gasPrice":"0x098bca5a00",
                                          "gasLimit":"0x0153df",
                                          "to":smartContract.address,
                                          "value":"0x00",
                                          "data":smartContract.transfer.getData(order.ethaddress, order.tokens * 1e18, {from: adminAddress}),
                                          "chainId":4
                                      }

                    console.log("Found order.....2. rawTransaction", rawTransaction);

                      var sleep = require('system-sleep');
                      sleep(1000); // sleep 1 secs

                      var tx = new Tx(rawTransaction);
                      tx.sign(privKey);

                      console.log("Found order.....3. tx", tx);
                      var sleep = require('system-sleep');
                      sleep(1000); // sleep 1 secs                     var serializedTx = tx.serialize();
                  
                      var serializedTx = tx.serialize();
                      web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
                        if (!err)
                        {
                                console.log("done.......", hash);
                                order.txnnumber = hash;                                           
                                order.save((err, order1) => {                                            
                                        res.json(hash);
                                  }); // save
                         }
                        else
                         {      
                             console.log(err);
              
                         }
                    });

                 // smartContract.buyTokensManual.sendTransaction(order.ethaddress, order.ether * 1e18, {
                 //                        from: config.get('ethereum.adminAddress'),
                 //                        gas: config.get('ethereum.gas'),
                 //                        gasPrice: config.get('ethereum.gasPrice')
                 //                    }, function (error, txnno) {
                 //                        if (error) {
                 //                            console.error(error)
                 //                        } else {
                 //                            console.log("Send transaction successful " + txnno)                                  
                 //                            order.txnnumber = txnno;                                           
                 //                            order.save((err, order1) => {                                            
                 //                                    res.json(txnno);
                 //                                  //   });
                 //                              }); // save
                 //                          }  // send successful..
                 //                      }); // sendTransaction
             }); // order findby id
        } else {
               res.json("manual");
        }
  });  // app.post


app.post('/updateTokens/:orderid', function(req, res){

console.log("Order id...", req.params.orderid);

// process.on('uncaughtException', (e) => { console.log('no worries'); });
// process.on('unhandledRejection', (e) => { console.log('relax bro'); });

  try { 
         const abiDecoder = require('abi-decoder');
         abiDecoder.addABI(abiDefinition);

		    	Order.findById(req.params.orderid, (err, order) => {
            		if (err) {
            			 console.log("Order not found...");
            			 throw err;
            		} else {

            			   console.log("Order found...", order);
		                   var orderTime = new Date(order.updated).getTime();
		                   var nowTime   = new Date().getTime();
		            
		                    var timeDiffInMins = Math.abs(nowTime - orderTime) / (1000 * 60) 
		                    //one_day means 1000*60*60*24
		                    //one_hour means 1000*60*60
		                    //one_minute means 1000*60
		                    //one_second means 1000
		                    // console.log("orderTime ...", orderTime);
		                    // console.log("nowTime.... ", nowTime);

		                    // console.log("Difference  ... ", timeDiffInMins);
		                    // console.log("Difference  ... ", Math.abs(nowTime - orderTime));


		                    // blockchain refresh abt a transaction after 5 mins...
		                   // console.log("Minutes from updated time", timeDiffInMins);
		            
		                    // if (timeDiffInMins > 5) 
		                    // {

		                   web3.eth.getTransactionReceipt(order.txnnumber, function(err, receipt) {
		                        if (err) {
		                        	console.log("Error in blockchain query.. ", err);
		                        	throw err;
		                        } 
		                        console.log("Order : ",order);
		                        decodedLogs = abiDecoder.decodeLogs(receipt.logs);
		                        tokens = decodedLogs[0].events[2].value / 1e18;
		                        console.log("Tokens ", tokens);
		            
		                        // Save the updated document back to the database
		                                order.tokenstransferred = parseFloat(tokens).toFixed(4);
		                                order.save((err, ord1) => {
		                                    if (err) {
		                                        res.status(500).send(err)
		                                    	} else {
		                                    		console.log( order.id +" Order refreshed");
		                                    		res.json("Updated..");
		                                    	}
		                                });  // order save
		                            });      // blockchain txn
		               } // foundOrder
            }); // order find...
    
    } catch (err) { 
        console.log("catch error", err) 
    } finally {
         console.log("finally ...  catch error") 
    }
}); // app.post

//

app.get('/userorders', function(req, res){

      sess = req.session;
      address = sess.address;  

      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
			console.log ("2 req.session.user[_id]...", req.session.user["_id"]);
			var params = {userid: req.session.user["_id"]};
			var orderDetails = [];
			// params = {paymentstatus: 'Received'}; 
			// params = {}; 
			//
			// Order.find(params).sort([['updated', -1]]).exec(function (err, orders) {

            var uid= req.session.user["_id"];
            var mongoose = require('mongoose');
            var userID = new mongoose.Types.ObjectId(uid);

            User.findOne({_id:userID}, (err, userData) => {
            if(err){
              console.log(JSON.stringify(err));
            }else {
              if(userData){
				 console.log("Start -->>1 ", userData);
                  Order.find(params).sort([['orderdate', 1]]).exec(function (err, orders) {
                      if (err) {
                          console.log(err);
                      }
						
						console.log("Start -->>2 ", orders);
						
                          var dateNow = new Date();
                          var moment = require('moment-timezone');
                          datePrice = moment.tz(dateNow, "Asia/Seoul").format('DD-MMM-YYYY')
                          console.log("==================")
                          console.log("date for price...", datePrice)
                          var prices = config.get('prices');
                          var tokenPrice = 0;

                          console.log("==================")
                          
                          if(funcs.isEmpty(prices[datePrice]))
                          {
                                tokenPrice  =  parseFloat(prices["default"].Price);  

                          }else {
                                tokenPrice  =  parseFloat(prices[datePrice].Price);  

                          }

                        console.log("price for now...", tokenPrice);
                        
                        var fullname = '';
                        if(typeof userData.firstname!='undefined' && userData.firstname!=''){
                          fullname = userData.firstname;
                        }
                        if(typeof userData.lastname!='undefined' && userData.lastname!=''){
                          fullname = fullname+ " " +userData.lastname;
                        }
                        
						console.log("Start -->>3 ");
						
                        //for widget only 
                        var userID = req.session.user["_id"];
                        var where = {referralby:userID};
                        var scriber_count=0;
                         User.find(where).exec(function (err, subscribers) {
                            if(err){
                                console.log(err);
                            }
                            if(subscribers.length>0){
                                scriber_count = subscribers.length;
                            }
                            
							console.log("Start -->>4 ",subscribers);
							
                            var ref_users = [];
                            subscribers.forEach(function(ref){
                                ref_users.push(ref._id)
                            });
                            
                            var order_params = {userid: ref_users};
                            var total_referral = 0;
                            var refer_bonus=0;
                            var refer_amount=0;
                            var lynk_total=0;
							var owner_lynk_total=0;
                            var current_user_lynk = 0;
                             
                            orders.forEach(function(owntrans){
                              if(typeof owntrans.tokens!='undefined' && owntrans.tokens!=''){
                                 owner_lynk_total = parseFloat(owner_lynk_total)+parseFloat(owntrans.tokens);
								 current_user_lynk=owner_lynk_total;
                              }
                            });
							
							if(current_user_lynk>0){
								current_user_lynk   = current_user_lynk.toFixed(2);
							}
							
							console.log("Start -->>5 ");
	
                             Order.find(order_params).exec(function (err, ordersRefer) {
                                if (err) {
                                    console.log(err);
                                }
								
								console.log("Start -->>5 ",ordersRefer);
								
                                ordersRefer.forEach(function(orderAmt){
                                  var amount_temp=0;
                                  if(typeof orderAmt.amount!='undefined' && orderAmt.amount!='' && typeof orderAmt.conversion!='undefined'){
                                    amount_temp = parseFloat(orderAmt.amount)*parseFloat(orderAmt.conversion);
                                  }
                                  
                                  if(typeof orderAmt.tokens!='undefined' && orderAmt.tokens!=''){
                                    lynk_total = parseFloat(lynk_total)+parseFloat(orderAmt.tokens);
                                  }

                                  total_referral = parseFloat(total_referral)+parseFloat(amount_temp);
                                });
								
                                if(total_referral>0){
                                    refer_amount = total_referral.toFixed(2);
									if(lynk_total>0){
										lynk_total   = lynk_total.toFixed(2);
									}
								}
								
								console.log("Start -->>6 ");
								
                                //get ether/btc price
                                var btc = 0.0001;
                                var eth = 200;
                                var ltc = 0.01;
									res.render('orders_users_new', {
									 orders : orders,
									 layout: false,
									 eth: ethToUSD,
									 btc: btcToUSD,
									 tokenPrice: tokenPrice,
									 userInfo:userData,
									 name: fullname,
									 ref_signup:scriber_count,
									 ref_earning:refer_amount,
									 ref_bonus:refer_bonus,
									 cur_user_lynk:current_user_lynk,
									 btc: btc,
									 eth: eth,
									 ltc: ltc,
									});
                                });
                             });
                        });
                    }
                }
            }); 
  
        } // else
  });
//


 // if (!funcs.isEmpty(user.ethpaymentwallet)){

 //                           Web3 = require('web3')
 //                           web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host')));

 //                            web3.eth.getBalance(user.ethpaymentwallet, function(err, balance) {
 //                                if (err) {
 //                                  console.log("Error in blockchain query.. ", err);
 //                                  throw err;
 //                                } 
 //                                //console.log("Wallet : ",order.paymentwallet);
                               
 //                                var walletBalance = balance/1e18;
 //                                console.log("balance ", walletBalance);
 //                                user["ethbalance"] = parseFloat(walletBalance).toFixed(4) ;


//
   
app.get('/admin', function(req, res){

      sess = req.session;
      address = sess.address;  

      if(funcs.isEmpty(sess.user)) {
            res.redirect('/login');
       } else {
                 var params = {};
                 var orderDetails = [];
                 //params = {paymentstatus: 'Received'}; 
                  params = {}; 
                  Order.find(params).sort([['updated', -1]]).exec(function (err, orders) {
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



                            var alasql = require('alasql');
                            var subTotal = alasql('SELECT paymenttype, sum(CAST(amount as float)) AS amount FROM ? GROUP BY paymenttype', [orders]);
                            var totalraised = alasql('SELECT sum(CAST(amount as float)) AS amount FROM ? ', [orders]);
                            //CAST('7082.7758172' as float)

                            var paypalTotal = 0;
                            var fiatTotal = 0;
                            var cryptoTotal = 0;
                            var bankTotal = 0;
                            var othersTotal = 0;


                            for (i = 0; i < subTotal.length; i++) {
                                switch (subTotal[i].paymenttype) {
                                    case "Paypal":
                                        paypalTotal = subTotal[i].amount;
                                        break;
                                    case "Credit Card":
                                        fiatTotal = subTotal[i].amount;
                                        break;
                                    case "Bank Wire":
                                        bankTotal = subTotal[i].amount;
                                        break;
                                    case "Crypto":
                                        cryptoTotal = subTotal[i].amount;
                                        break;
                                }
                            }



                            res.render('orders', {
                                     orders : orders,
                                     layout: false,
                                     name: req.session.user.firstname + " " + req.session.user.lastname,
                                     paypalTotal: parseFloat(paypalTotal).toFixed(2),
                                     fiatTotal: parseFloat(fiatTotal).toFixed(2),
                                     bankTotal: parseFloat(bankTotal).toFixed(2),
                                     cryptoTotal: parseFloat(cryptoTotal).toFixed(2), 
                                     othersTotal: parseFloat(othersTotal).toFixed(2), 
                                     orderTotal: parseFloat(totalraised[0].amount).toFixed(2)                                     
                                    //messages: messages
                        });
                });
     } // else
});
//

app.post('/updatePayment1/:orderid', function(req, res){
    console.log("Order id...", req.params.orderid);
    try { 
        const abiDecoder = require('abi-decoder');
        abiDecoder.addABI(abiDefinition);

        Order.findById(req.params.orderid, (err, order) => {
                if (err) 
                {
                     console.log("Order not found...");
                     throw err;
                } else {

                     var Coinpayments = require('coinpayments');

                        options = {
                            key : config.get("coinpayments.key"),
                            secret : config.get("coinpayments.secret")
                            }
                        
                        var client = new Coinpayments(options);

                        txn_id = order.paymentreference;
                        console.log("Coinpayments txn id...", txn_id);
                        if (txn_id) 
                        {
                              client.getTx(txn_id, function(err,paystatus){

                                    if (err) { res.status(500).send(err) } 
                                      console.log( "paystatus....", paystatus);
                                      console.log("TXN status:", paystatus.status, "  pay status message..: ",  paystatus.status_text);
                                      
                                      if (paystatus.status < 0) 
                                      {
                                          order.paymentstatus = 'Payment Cancelled';
                                         // Save the updated document back to the database
                                          order.save((err, ord) => {
                                                if (err) { res.status(500).send(err) } 
                                                      //res.status(200).json({
                                                     // });
                                                }); // save
                                            var sleep = require('system-sleep');
                                            sleep(1000); // sleep 2 secs
                                      }

                                      if (paystatus.status > 0)
                                      {  
                                        if (config.get('ethereum.transaction') == "1"){
                                          smartContract.buyTokensManual.sendTransaction(order.ethaddress, order.ether * 1e18, {
                                                      from: config.get('ethereum.adminAddress'),
                                                      gas: config.get('ethereum.gas'),
                                                      gasPrice: config.get('ethereum.gasPrice')
                                              }, function (error, txnno) {
                                                        if (error) {
                                                             res.status(500).send(error); 
                                                          } else {
                                                              console.log("Send transaction successful " + txnno)
                                                              order.txnnumber = txnno;
                                                              order.paymentstatus = 'Received';
                                                              console.log("New Order :", order)
                                                              // Save the updated document back to the database
                                                              console.log("updating order...", req.params.orderid ,  paystatus.status_text);
                                                              order.save((err, ord) => {
                                                                 if (err) { res.status(500).send(err) 
                                                                 } else {  

                                                                  if( config.get('mailchimp.enabled') == "1") {  
                                                                         var request = require('superagent');
                                                                         var mailchimpInstance             = config.get('mailchimp.mailchimpInstance'); //'us17',
                                                                         var listUniqueId                   = config.get('mailchimp.listUniqueId');  // '4a4c2a0f58',
                                                                         var listUniqueIdPendingPayment     = config.get('mailchimp.listUniqueIdPendingPayment');   //'adc1834d485062b3f3e4355c1c8e4b75-us17';
                                                                         var mailchimpApiKey     = config.get('mailchimp.mailchimpApiKey');   //'adc1834d485062b3f3e4355c1c8e4b75-us17';

                                                                           var emailAddress = req.session.user.email.toLowerCase()   
                                                                           hash = require('crypto').createHash('md5').update(emailAddress).digest('hex'),
                                                                           request.delete('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueIdPendingPayment + '/members/'+hash).set('Content-Type', 'application/json;charset=utf-8').set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64')).send({'status': 'unsubscribe'}).end(function(err, response) {
                                                                            if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
                                                                                console.log('Removed address from Pending mail list......');
                                                                             
                                                                            } else {
                                                                              console.log('Remove failed...from the Pending mail list.. :(', err);
                                                                        
                                                                            }
                                                                        });  // request
                                                                       }; // mailchimp enabled
                                                                     }  // else save
                                                                  }); // save
                                                                    var sleep = require('system-sleep');
                                                                 sleep(2000); // sleep 2 secs
                                                    } // if else txnno
                                              }) // sendTransaction
                                   
                                            } // manual - auto blockchain transaction
                                          } // if paystatus > 0
                                    }); // client get tx - coin payments tx.
                            }; // coinpayment txid in the db..
                } // if else findOrder by ID
        }) // findOrder by id
      } catch(err){
          console.log("Catch - Error occured.. during updating token..", err);
      } finally {
         console.log("finally ...  catch error") 
     }

}); // app.post - update payment status and place order 


//
//
//

app.post('/updatePayment/:orderid', function(req, res){

Web3 = require('web3')
//web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/4vsHVZygsQz7d5rxTVqG"));
web3 = new Web3(new Web3.providers.HttpProvider(config.get('ethereum.host')));

console.log("Update Payment : Order id...", req.params.orderid);

// process.on('uncaughtException', (e) => { console.log('no worries'); });
// process.on('unhandledRejection', (e) => { console.log('relax bro'); });

  try { 
          const abiDecoder = require('abi-decoder');
          abiDecoder.addABI(abiDefinition);

          Order.findById(req.params.orderid, (err, order) => {
                if (err) {
                   console.log("Order not found...");
                   throw err;
                } else {

                       console.log("Order found...", order);
                      // var orderTime = new Date(order.updated).getTime();
                      // var nowTime   = new Date().getTime();
                
                      //  var timeDiffInMins = Math.abs(nowTime - orderTime) / (1000 * 60) 
                        console.log("Payment Wallet", order.paymentwallet);

                        web3.eth.getBalance(order.paymentwallet, function(err, balance) {
                            if (err) {
                              console.log("Error in blockchain query.. ", err);
                              throw err;
                            } 
                            console.log("Wallet : ",order.paymentwallet);
                            //decodedLogs = abiDecoder.decodeLogs(receipt.logs);
                            //tokens = decodedLogs[0].events[2].value / 1e18;
                           
                            var walletBalance = balance/1e18;
                             console.log("balance ", walletBalance);
                
                            // Save the updated document back to the database
                                if (walletBalance > 0)
                                {
                                    order.amount = walletBalance;
                                    order.paymentstatus = "Received";
                                    order.conversion = ethToUSD;

                                    order.save((err, ord1) => {
                                        if (err) {
                                            res.status(500).send(err)
                                          } else {
                                            console.log( order.id +" Order refreshed");
                                            res.json("Updated..");
                                          }
                                    });  // order save

                                  } else {
                                       console.log( " Balance is zero");
                                       res.json("Amoutn not Received..");
                                  }
              
                                });      // blockchain txn
                   } // foundOrder
            }); // order find...
    
    } catch (err) { 
        console.log("catch error", err) 
    } finally {
         console.log("finally ...  catch error") 
    }
}); // app.post



} // module.exports