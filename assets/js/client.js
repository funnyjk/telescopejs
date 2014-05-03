//==========Socket.io==========
var urlLink = '107.170.68.139:5000';
var socket = io.connect(urlLink);

//===Testing===
var localLink = '192.168.1.13:5000';
var socketLocal = io.connect(localLink);
socketLocal.on('connect', function() {
	socketLocal.emit('client');
});

//====On Conntection====
socket.on('connect', function() {
	socket.emit('client');
});
//==========Functions==========
//Send Direction 
function direction(direction) {
	socket.emit('direction', direction);
	socket.emit('test', direction);
}
//Send Speed
function speed(speed) {
	socket.emit('speed', speed);
	socket.emit('test', speed);
}
//====Testing====
//Send Destination
function dest(data) {
	socket.emit('destination', data);
	socket.emit('test', data);
}