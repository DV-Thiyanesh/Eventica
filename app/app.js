
var express = require('express'),
  app = module.exports = express();
  var session = require('express-session');
  app.use(session({secret: 'ssshhhhh'}));
 
  app.engine('.html', require('ejs').__express);
  app.use(express.static(__dirname + '/public'));
 
  bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  var flash = require('express-flash');
  app.use(flash());

  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');

 require('./controller/login')(app);  
 require('./controller/event')(app);
 require('./controller/product')(app); 
   require('./controller/eventica')(app);
  require('./controller/details')(app);
    require('./controller/merchantview')(app);
     require('./controller/eventhistory')(app);
      require('./controller/news')(app);



   

//app.set('view engine', 'ejs');
 // Require body-parser (to receive post data from clients)
 // var config = require('/config');
// require('./models').connect(config.get('db'));
const User = require('./models/User.js');
// const Ticket=require('./models/ticket.js');

const mongoose = require('mongoose')
const path = require('path');
const port = 80

mongoose.connect('mongodb://admin:admin123@ds343887.mlab.com:43887/eventica', {
    useNewUrlParser: true
}, (err, client) => {
    if (err) throw err;

    else {

        console.log("mongodb connected")
    }
})


if (!module.parent) {
 server= app.listen(80)
  console.log('Running in port 80');
}
io = require('socket.io').listen(server);
app.get('/', function (req, res) {
  sess = req.session;
  address = sess.address; 
 
  if(req.session.user) {
        res.render('eventica',{

        });
  }
          else {
      res.render('firsteventica', {
                       
          });
}

});
app.get('/eventica', function (req, res) {
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
app.get('/exchange',function(req, res){
  res.render('exchange',{

  });
});
app.get('/cryptonews',function(req, res){
  res.render('cryptonews',{

  });
});
app.get('/chat',function(req, res){
  sess = req.session;
  
console.log(sess,"req.sedss")

username=req.session.user.firstname + req.session.user.lastname
console.log(username,"username")
  res.render('chat',{
    // username:req.session.user.firstname + req.session.user.lastname


  });
});



var usernames = {};


// rooms which are currently available in chat
var rooms = ['CHENNAI','MUMBAI','DELHI'];

io.sockets.on('connection', function (socket) {
	
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
    socket.room = 'CHENNAI';
   
    // var room= io.sockets.adapter.rooms[socket.room]
    // roomlen=room
    // console.log(room,"room")
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
    socket.join('CHENNAI');


		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to CHENNAI');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('CHENNAI').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'CHENNAI');
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});
	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});

app.get('/referral',function(req, res){
  
  res.render('referral',{

  });
});
app.get('/eventhistory',function(req, res){
  res.render('eventhistory',{

  });
});
app.get('/merchantpayment',function(req,res){
 
  if(req.session.user)
  {
  res.render('merchantpayment',{

  });
  }
  else{
    
    res.render('signin',{
           
  });
  }
});
app.get('/eventpayment',function(req,res){
  
  if(req.session.user)
  {
  res.render('eventpayment',{

  });
  }
  else{
  
   res.render('signin',{
                    
  });
  }
    
  
});
// app.get('/merchantpayment',function(req,res){
//     res.render('merchantpayment',{
  
//     });
//   });
// app.get('/eventpayment',function(req,res){
//     res.render('eventpayment',{
  
//     });
//   });
// app.get('/payment1',function(req,res){
//   res.render('payment1',{

//   });
 
// });
  app.get('/cart',function(req,res){
    res.render('cart',{
  
    });
  });
  app.get('/carts',function(req,res){
    res.render('carts',{
  
    });
  });


app.get('/eventcheckout',function(req,res){
  res.render('eventcheckout',{

  });
});

app.post('/merchantcheckout',function(req,res){
  res.render('merchantcheckout',{

  });
});
app.get('/merchantcheckout',function(req,res){
  res.render('merchantcheckout',{

  });
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

// app.get('/', function (req, res) {
//   sess = req.session;

// var referral = '';

// if(typeof req.param('ref')!='undefined' && req.param('ref')!='' && req.param('ref')!=null){
//  referral=req.param('ref');
// }

//    if(funcs.isEmpty(sess.user)) {
//              res.render('eventica', {
//                 layout:false,
//           referral_code:referral
//            });
//          } else {

//             res.redirect('/');
//          }


//      });


