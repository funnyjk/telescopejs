//==========Socket.io==========
var urlLink = '107.170.68.139:8080';
var socket = io.connect(urlLink);

//===Testing===
var localLink = '192.168.1.18:8080';
var socketLocal = io.connect(localLink);
socketLocal.on('connect', function() {
	socketLocal.emit('client');
});

//Variables
var clientID = "";
var telescopeID = "";
var sendButton = document.getElementById("send");

//====On Conntection====
socket.on('connect', function() {
	socket.emit('client');
});
//==========Functions==========
//Send Direction 
function direction(direction) {
	socket.emit('direction',  telescopeID, direction);
	socket.emit('test', direction);
	console.log(direction + " : " + telescopeID);
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
function selectTelescope(id) {
	telescopeID = id;
}
socket.on('clientTest', function(data) {
	console.log(data);
});
//=Test=
function send() {
	var controls = document.getElementById("control").value;
	var modif = document.getElementById("mod").value;
	control(controls, modif);
}

	