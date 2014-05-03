//====================Telescope Dependencies====================
var	serialport = require("serialport"),
	SerialPort = serialport.SerialPort, // localize object constructor
	fs = require('fs'),
	socketIO = require('socket.io-client');

//==========Variables==========
var	socketServer = '107.170.68.139:5000';

//==========SERIAL Configuration==========
var portName = '/dev/ttyUSB0';
var serial = new SerialPort(portName, {
	baudRate: 9600,
	dataBits: 8, 
	parity: 'none', 
	stopBits: 1, 
	flowControl: false,
	parser: serialport.parsers.raw
});
//Opens the serial connection
function serial_start() {
	serial.on("open", function () {
		console.log('open serial communication');
	});
}
//Runs the serial function
serial_start();

//==========Functions==========
//====Telescope Controls====
//Direction
var tdirection = {
	north: function () { serial.write(':Mn#'); },
	east:  function () { serial.write(':Me#'); },
	south: function () { serial.write(':Ms#'); },
	west:  function () { serial.write(':Mw#'); },
	stop:  function () { serial.write(':Q#'); }
};
//Speed
var tspeed = {
	G: function () { serial.write(':RG#'); },
	C: function () { serial.write(':RC#'); },
	M: function () { serial.write(':RM#'); },
	S: function () { serial.write(':RS#'); }
};

//==========Testing Area==========
// testing for querying location movement
// function location() {
// 	serial.write(':GC#', function(err, callback) {
// 		console.log('err: ' + err + 'callback: ' + callback);
// 	}
// )};
// //testing for slewing to destination
// var dest = {
// 	dec: function () { serial.write(':Sas90*53#'); },
// 	go: function () { serial.write(':MA#'); }
// };
// //View Serial Data
// serial.on('data', function(data) {
// 	console.log(data);
// });

//====================Socket.io====================
//Socket.io-client connection information
var socket = socketIO.connect(socketServer)
socket.on('connect', function(){
//====Socket.io Connect====
	//Tell the server this is a telescope
	socket.emit('telescope');

//==Various Sockets==	
	//Direction == Client == Telescope
	socket.on('tmove', function(direction) {
		tdirection[direction]();
		//location();
	});
	//Set Speed == Client == Telescope
	socket.on('tspeed', function(speed) {
		tspeed[speed]();
	});
	//console.log tests socket.io
	socket.on('test', function(data) {
		console.log(data);
	}); 
});