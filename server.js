//====TelescopeJS == Server.js====
//====================Server Dependencies====================
var express = require('express'),
	app = express(),
	server = require('http'),
	io = require('socket.io'),
	fs = require('fs'),
	mongoose = require('mongoose');
	//webRTC = require('webrtc.io').listen(server);

//====================Express Configure====================
app.configure(function(){
	app.use(express.static(__dirname + '/public'));
	app.use(express.static(__dirname + '/assets'));
	app.use(express.static(__dirname + '/node_modules'));
	app.use(express.bodyParser());
});
//====================Servers====================
server.createServer(app);
//==========Server Ports==========
var webPort = 80;
var socketPort = 8080;
//==========Server Listen==========
app.listen(webPort, function() {
	console.log("Listening on " + webPort);
});
io.listen(socketPort, function() {
	console.log("Socket on " + socketPort);
});

//====================Mongoose Configure====================
mongoose.connect('mongodb://localhost/telescope');

//====Define Schema====
var Schema = mongoose.Schema;

//Telescope Schema
var telescopeSchema = new Schema({
	socketid: String,
	name: String
});
//Client Schema
var clientSchema = new Schema({
	socketid: String,
	name: String
});

//====Define Model====
//Telescope Schema
var telescopeModel = mongoose.model('telescope', telescopeSchema);
//Client Schema
var clientModel = mongoose.model('client', clientSchema);	

//====ON Start====
function on_start(){
	telescopeModel.remove({}, function(err, telescopes) {
		if (err)
		console.log('Deleting Error: ' + err);
	});
	clientModel.remove({}, function(err, clients) {
		if (err)
		console.log('Deleting Error: ' + err);
	});
}
//====================Routes====================
app.get('/', function(req, res){
  res.sendfile(__dirname + 'public/index.html');
})

//====================API====================
//List All Telescopes
app.get('/api/telescopes', function(req, res) {
	//Mongoose
	telescopeModel.find(function(err, telescopes) {
		//error checking
		if (err) res.send(err)
		res.json(telescopes);
	});
});
//List all clients
app.get('/api/clients', function(req, res) {
	//Mongoose
	clientModel.find(function(err, clients) {
		//error checking
		if (err) res.send(err)
		res.json(clients)
	});
});
//Test
app.get('/api/test', function(req, res) {
	res.send('hello world');
});

//====================Functions====================
//====Telescope====
//==Slew in direction==
function smovement(id, tmovement) {  io.sockets.socket(id).emit('tmove',tmovement); }

//==Set Telescope Speed==
function sspeed(id, tspeed) { io.sockets.socket(id).emit('tspeed',tspeed); }

//==Various Controls==
function scontrol(id, tcontrol, modify) { io.sockets.socket(id).emit('tcontrol', tcontrol, modify); }

//==testing sockets==
function clientTest(id, data) { io.sockets.socket(id).emit('clientTest', data); }

var clients = {};
//====================Socket.io====================
io.set('log level', 1);
io.sockets.on('connection', function(socket) {
	var socketid = socket.id;
// 	console.log('Socket: ' + socketid + ' Connected');
//====Socket.io Connect====
	//Telescope Connect
	socket.on('telescope', function(socket) {
		console.log('Telescope: ' + socketid + ' Connected');
		//Add to Mongoose
		var telescope = new telescopeModel();
		telescope.socketid = socketid;
		telescope.save(function(err) {
			if (err) console.log(err);
		});
	});
	//Client Connect
	socket.on('client', function(socket) {
		console.log('Client: ' + socketid + ' Connected');
		//Add to Mongoose
		var client = new clientModel();
		client.socketid = socketid;
		client.save(function(err) {
			if (err) console.log(err);
		});
	});
	  
//====Various Sockets====
	//Directional Movement === Client === Telescope
	socket.on('direction', function(id, direction) {
		smovement(id, direction);
 		//clientTest(id, direction);
		//console.log('id: ' + id + ' direction: ' + direction);
	});
	//Set Speed === Client === Telescope
	socket.on('speed', function(id, speed) {
		sspeed(id, speed);
	});
	//Various Controls
	socket.on('control', function(id, control, mod) {
		scontrol(id, control, mod);
	});
	//Console Log incoming information
	socket.on('test', function(data) {
		console.log(data);
	});
	socket.on('sendImage', function (data) {
		//emit the image
		socket.broadcast.emit('getImage', data);
	});
//==========Disconnects==========
	//On Telescope disconnect
	socket.on('disconnect', function(socket) {
		telescopeModel.remove({
			socketid: socketid
		}, function(err, telescopes) {
			if (err)
			console.log('Deleting Error: ' + err);
		});
	//On Client Disconnect
		clientModel.remove({
			socketid: socketid
		}, function(err, clients) {
			if (err)
			console.log('Deleting Error: ' + err);
		});
		console.log('Socket: ' + socketid + ' Disconnected');
	});
});

//====================On Start====================
on_start();
