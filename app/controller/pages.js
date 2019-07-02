const Order = require('../models/Order.js');
var funcs = require('../functions');

var config = require('config');
const User = require('../models/User.js');

module.exports = function(app){



app.get("/terms-and-conditions", function (req, res) {
      sess = req.session;
      
      res.render('terms-and-conditions', {
          layout: false,
          status: "OK",
          title: "Terms & Conditions | Lynked.World",
      });
});

app.get("/privacy-policy", function (req, res) {
      sess = req.session;
      
      res.render('privacy-policy', {
          layout: false,
          status: "OK",
          title: "Privacy Policy | Lynked.World",
      });
});

app.get("/rewards", function (req, res) {
      sess = req.session;
      
      res.render('rewards', {
          layout: false,
          status: "OK",
          title: "Rewards | Lynked.World",
      });
});

app.get("/feature", function (req, res) {
      sess = req.session;
      
      res.render('feature', {
          layout: false,
          status: "OK",
          title: "Feature | Lynked.World",
      });
});

app.get("/cookie-policy", function (req, res) {
      sess = req.session;
      
      res.render('cookie-policy', {
          layout: false,
          status: "OK",
          title: "Cookie Policy | Lynked.World",
      });
});


app.get("/index-ja", function (req, res) {
      sess = req.session;
      
      res.render('index_JA', {
          layout: false,
          status: "OK",
          title: "Tokensale JA | Lynked.World",
      });
});

app.get("/index-ko", function (req, res) {
      sess = req.session;
      
      res.render('index_KO', {
          layout: false,
          status: "OK",
          title: "Tokensale KO | Lynked.World",
      });
});

app.get("/index-ru", function (req, res) {
      sess = req.session;
      
      res.render('index_RU', {
          layout: false,
          status: "OK",
          title: "Tokensale RU | Lynked.World",
      });
});

app.get("/index-ch", function (req, res) {
      sess = req.session;
      
      res.render('index_CH', {
          layout: false,
          status: "OK",
          title: "Tokensale CH | Lynked.World",
      });
});

}
