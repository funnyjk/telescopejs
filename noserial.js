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
 
var tmovement = {
  north: function () { console.log(':Mn#'); },
  east:  function () { console.log(':Me#'); },
  south: function () { console.log(':Ms#'); },
  west:  function () { console.log(':Mw#'); },
  stop:  function () { console.log(':Q#'); }
 // test: function () { console.log('HELLOWORLD');}
};
var tspeed = {
  G: function () { console.log(':RG#'); },
  C: function () { console.log(':RC#'); },
  M: function () { console.log(':RM#'); },
  S: function () { console.log(':RS#'); }
};

io.sockets.on('connection', function(socket) {
  
  socket.on('direction', function(direction) {
    tmovement[direction]();
  });
  socket.on('speed', function(speed) {
    tspeed[speed]();
  });
  socket.on('test', function(data) {
    console.log(data);
  });
});
