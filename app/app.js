
var express = require('express'),
  app = module.exports = express();

//app.set('view engine', 'ejs');
app.engine('.html', require('ejs').__express);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');
// var config = require('/config');
// require('./models').connect(config.get('db'));
// require('./controller/login')(app);   
// const User = require('./models/User.js');
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

app.get('/email', function(req, res){

  sess = req.session;
  address = sess.address;  

  if(funcs.isEmpty(sess.user)) {
        res.redirect('/signin');
   } else {
      res.render('editor_ckeditor_for_email', {
           layout:false,
           name: req.session.user.firstname + " " + req.session.user.lastname                
          });
} // session
});  


// Serve the index page
app.post('/email', function(req, res){
var message = req.body.editor_full;
var email_to = req.body.email_to;
var subject = req.body.subject;
        //console.log(message);

        const nodemailer = require('nodemailer')

        var transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: 'saravana.malaichami@gmail.com',
                pass: ''
            }
        });
        


         var mailOptions = {
            from: 'lmicoadmin@lmico.com',
            to: email_to,
            subject: subject,
            html: message
        }; 
        
        //'Dear '+ name +'\n\nYou have received ' + tokens+' LMI tokens from LMICO. \n\nYour Ethereum Wallet is : '+ toaddress +'\nTransaction reference is : ' + txnno +'\n\nRegards, \nLMICO Admin'
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }
            console.log("mail send successfully", info);
        }); 

        res.send("email sent...");

});  

app.get('/', function (req, res) {
  sess = req.session;

var referral = '';

if(typeof req.param('ref')!='undefined' && req.param('ref')!='' && req.param('ref')!=null){
 referral=req.param('ref');
}

   if(funcs.isEmpty(sess.user)) {
             res.render('index', {
                layout:false,
          referral_code:referral
           });
         } else {

            res.redirect('/eventica');
         }


     });


