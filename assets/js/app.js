//==========Socket.io==========
var urlLink = '107.170.68.139:8080';
var socket = io.connect(urlLink);

//===Testing===
var localLink = '192.168.1.13:8080';
var socketLocal = io.connect(localLink);
socketLocal.on('connect', function() {
	socketLocal.emit('client');
});

//Variables
var clientID = "";

//====On Conntection====
socket.on('connect', function() {
	socket.emit('client');
});
//==========Functions==========
//Send Direction 
function direction(direction) {
	socket.emit('direction', direction);
	socket.emit('test', direction);
	console.log(direction + " : " + clientID);
}
//Send Speed
function speed(speed) {
	socket.emit('speed', speed);
	socket.emit('test', speed);
}
//Various Controls
function control(control, mod) {
	socket.emit('control', control, mod);
	socket.emit('test', mod);
}
//====Testing====
//Send Destination
function dest(data) {
	socket.emit('destination', data);
	socket.emit('test', data);
}
function selectClient(id) {
	clientID = id;
}
socket.on('clientTest', function(data) {
	console.log(data);
}