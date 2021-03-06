//====TelescopeJS == Server.js====
//====================Server Dependencies====================
var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(8080),
	fs = require('fs'),
	mongoose = require('mongoose');
	//webRTC = require('webrtc.io').listen(server);

//====================Express Configure====================
app.configure(function(){
	app.use(express.static(__dirname + '/public'));
	app.use(express.static(__dirname + '/assets'));
	app.use(express.static(__dirname + '/node_modules'));
	app.use(express.json());
	app.use(express.urlencoded());
});

//==========Server Ports==========
var webPort = 80;
app.listen(webPort, function() {
	console.log("Listening on " + webPort);
});

//====================Variables====================
var clients = {};
//===Variables for Stream===
var WEBSOCKET_PORT = 8084;
var STREAM_SECRET = 'test';	//process.argv[2],
var STREAM_MAGIC_BYTES = 'jsmp';

var width = 320;
var height = 240;

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
//===Send Video in MPEG1===
app.post('/api/video/:secret/:width/:height', function(req, res) {
	width = (req.params.width || 320)|0;
	height = (req.params.height || 240)|0;
	
	if(req.params.secret == STREAM_SECRET) {
		console.log('Stream Connected');
		console.log(req.params.width);
		req.on('data', function(data) {
			//send the video over WebSockets
			videoBroadcast(data);
		});
	} else {
		console.log('Failed to Connect Stream');
	}
});
//Test
app.get('/api/test', function(req, res) {
	res.send('hello world');
});

//====================Functions====================
//========Telescope========
//==Slew in direction==
function smovement(id, tmovement) {  io.sockets.socket(id).emit('tmove',tmovement); }

//==Set Telescope Speed==
function sspeed(id, tspeed) { io.sockets.socket(id).emit('tspeed',tspeed); }

//==Various Controls==
function scontrol(id, tcontrol, modify) { io.sockets.socket(id).emit('tcontrol', tcontrol, modify); }

//==Client sockets==
function clientTest(id, data) { io.sockets.socket(id).emit('clientTest', data); }

//========Video Functions========
function videoBroadcast(data) {	//id,data
	socketServer.broadcast(data, {binary:true});
}

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
		
		//Send Buffer for Stream
		var streamHeader = new Buffer(8);
		streamHeader.write(STREAM_MAGIC_BYTES);
		streamHeader.writeUInt16BE(width, 4);
		streamHeader.writeUInt16BE(height, 6);
		io.emit('data', streamHeader, {binary:true});
		
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
//====================HTTP Server for Accepting MPEG Streams====================
// Websocket Server
var socketServer = new (require('ws').Server)({port: WEBSOCKET_PORT});
socketServer.on('connection', function(socket) {
	// Send magic bytes and video size to the newly connected socket
	// struct { char magic[4]; unsigned short width, height;}
	var streamHeader = new Buffer(8);
	streamHeader.write(STREAM_MAGIC_BYTES);
	streamHeader.writeUInt16BE(width, 4);
	streamHeader.writeUInt16BE(height, 6);
	socket.send(streamHeader, {binary:true});

	console.log( 'New WebSocket Connection ('+socketServer.clients.length+' total)' );

	socket.on('close', function(code, message){
		console.log( 'Disconnected WebSocket ('+socketServer.clients.length+' total)' );
	});
});

socketServer.broadcast = function(data, opts) {
	for( var i in this.clients ) {
		this.clients[i].send(data, opts);
	}
};
//====================On Start====================
on_start();
