var 
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(5000),
  fs = require('fs');
  
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/assets'));
});
  
app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
})
  
var port = 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
 
function smovement(tmovement) { socket.emit('tmove',tmovement); }

function sspeed(tspeed = { socket.emit('tspeed',tspeed); }

io.sockets.on('connection', function(socket) {
  
  socket.on('direction', function(direction) {
    smovement(direction);
  });
  socket.on('speed', function(speed) {
    sspeed(speed);
  });
  socket.on('test', function(data) {
    console.log(data);
  });
});
