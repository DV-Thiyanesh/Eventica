exports.myDateTime = function () {
    return Date();
};



// checcking whether Eth server running...
exports.isRunning = function () {
    try{ 
        return  web3.net.listening
        } catch(err){
                  return false;
        }
    return false;
};


exports.getSmartContractDetails = function () {
    tokenName   = smartContract.name();
    tokenSymbol = smartContract.symbol();
    totalSupply = parseFloat(smartContract.totalSupply() / 1e18).toFixed(4);
    totalUsed   = parseFloat(smartContract.tokenSold() / 1e18).toFixed(4);
    //tokenPrice  = 100;
    etherRaised  = smartContract.etherRaised()/1e18;


    console.log("Token Name ..:",tokenName);
    console.log("Token Symbol ..:",tokenSymbol);
    console.log("Total Supply ..:",totalSupply);
    console.log("Total Used ..:",totalUsed);
    console.log("Total Price ..:",etherRaised);
};



exports.isEmpty = function (obj) {

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


exports.getPrice = function () {
            var moment = require('moment-timezone');
            var config = require('config');
            var dateNow = new Date();
            datePrice = moment.tz(dateNow, config.get('general.timezone')).format('DD-MMM-YYYY')

            console.log("==================")
            console.log("date for price...", datePrice)

            var prices = config.get('prices');
            var tokenPrice = 0;

            if(isEmpty(prices[datePrice]))
            {
                  tokenPrice  =  parseFloat(prices["default"].Price);  
            }else {
                  tokenPrice  =  parseFloat(prices[datePrice].Price);  

            }


    return tokenPrice;
}


function isEmpty(obj) {

    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    if (typeof obj !== "object") return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

exports.inputSanitize = function (input) {
    var regex = /^[ A-Za-z0-9_.,#&-]*$/;
    return regex.test(input);
}

exports.addressSanitize = function (input) {
    var regex = /^[ A-Za-z0-9_./:;,#&-]*$/;
    return regex.test(input);
}

exports.passwordCheck = function (pass){
    var regex = /^[A-Za-z0-9_@.#&+-]*$/
    return regex.test(pass);
}
                   