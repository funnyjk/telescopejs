var urlLink = '192.168.1.13:5000';
var socket = io.connect(urlLink);

function direction(direction) {
  socket.emit('direction', direction);
  socket.emit('test', direction);
}
function speed(speed) {
  socket.emit('speed', speed);
  socket.emit('test', speed);
}
function test() {
  socket.emit('test', "test");
}
function dest(data) {
  socket.emit('destination', data);
  socket.emit('test', data);
}