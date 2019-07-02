
var express = require('express'),
  app = module.exports = express();

//app.set('view engine', 'ejs');
app.engine('.html', require('ejs').__express);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const mongoose = require('mongoose')
const path = require('path');
const port = 3000

mongoose.connect('mongodb://admin:admin123@ds343887.mlab.com:43887/eventica', {
    useNewUrlParser: true
}, (err, client) => {
    if (err) throw err;

    else {

        console.log("mongodb connected")
    }
})


if (!module.parent) {
  app.listen(3001)
  console.log('Running in port 3001');
}

app.get('/', function (req, res) {
  res.render('eventica', {
  });
});
app.get('/merchant', function (req, res) {
  res.render('merchantise', {
  });
});
app.get('/merchantview', function (req, res) {
  res.render('merchantiseview', {
  });
});
app.get('/events', function (req, res) {
  res.render('events', {
  });
});
app.get('/details', function (req, res) {
  res.render('details', {
  });
});
app.get('/eventica', function (req, res) {
  res.render('eventica  ', {
  });
});
app.get('/signin', function (req, res) {
  res.render('signin', {
  });
});
app.get('/signup', function (req, res) {
  res.render('signup', {
  });
});
app.get('/forgot', function (req, res) {
  res.render('forgot', {
  });
});
app.get('/redirect', function(req, res) {
  var url = share(req.query.service, req.query);
  res.redirect(url);
});


