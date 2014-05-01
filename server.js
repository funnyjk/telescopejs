var 
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(5000),
  fs = require('fs'),
  mongoose = require('mongoose');
  
//Mongoose Configure	=======================
mongoose.connect('mongodb://localhost/telescope');

//Express Configure		=======================
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/assets'));
  app.use(express.bodyParser());
});
  
//Define Model
var client = mongoose.model('client', {
	socketid: String
});	
var telescope = mongoose.model('telescope', {
	socketid: String
});

//Routes 				=======================
app.get('/', function(req, res){
  res.sendfile(__dirname + 'public/index.html');
})

//=======================API==============================================
	//List All Telescopes
	app.get('/api/telescope', function(req, res) {
		//Mongoose
		telescope.find(function(err, telescopes) {
			//error checking
			if (err) res.send(err)
			res.json(telescopes);
		});
	});
	app.get('/api/test', function(req, res) {
		res.send('hello world');
	});

//Express Port
var port = 80;
app.listen(port, function() {
	console.log("Listening on " + port);
});

//Functions to emit to telescope
  //move the telescope
 function smovement(tmovement) {  io.sockets.emit('tmove',tmovement); }
 //Set the speed of the telescope
 function sspeed(tspeed) { io.sockets.emit('tspeed',tspeed); }

//Socket information
io.sockets.on('connection', function(socket) {
  
  //Telescope Connect
  socket.on('telescope', function(socket) {
	var hs = socket.handshake;
		telescope.create({
			socketid: socket
		}, function(err, telescope) {
			if (err)
				console.log(err);
		});
	});
  
  socket.on('direction', function(direction) {
    smovement(direction);
  });
  socket.on('speed', function(speed) {
    sspeed(speed);
  });
  socket.on('test', function(data) {
    console.log(data);
  });
  
  //On telescope disconnect
  socket.on('disconnect', function(socket) {
	telescope.find({
		socketid: socket
	}, function(err, telescopes) {
		if (err)
			console.log('Deleting Error: ' + err);
	});
  });
});

