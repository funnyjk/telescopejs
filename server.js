var 
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(5000),
  serialport = require("serialport"),
  SerialPort = serialport.SerialPort, // localize object constructor
  fs = require('fs');

//SERIAL
var portName = '/dev/ttyUSB0';
var serial = new SerialPort(portName, {
  baudRate: 9600,
  dataBits: 8, 
  parity: 'none', 
  stopBits: 1, 
  flowControl: false 
});
  
var lightOn = false;

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
 
function serial_start() {
  serial.on("open", function () {
      console.log('open serial communication');
    });
}

serial_start();
var tdirection = {
  north: function () { serial.write(':Mn#'); },
  east:  function () { serial.write(':Me#'); },
  south: function () { serial.write(':Ms#'); },
  west:  function () { serial.write(':Mw#'); },
  stop:  function () { serial.write(':Q#'); }
};
var tspeed = {
  G: function () { serial.write(':RG#'); },
  C: function () { serial.write(':RC#'); },
  M: function () { serial.write(':RM#'); },
  S: function () { serial.write(':RS#'); }
};
var dest = {
  dec: function () { serial.write(':Sas90*53#'); },
  go: function () { serial.write(':MA#'); }
};

io.sockets.on('connection', function(socket) {
  
  socket.on('direction', function(direction) {
    tdirection[direction]();
  });
  socket.on('speed', function(speed) {
    tspeed[speed]();
  });
  socket.on('destinaton', function(data) {
    dest[data];
  });
  socket.on('test', function(data) {
    console.log(data);
  });
});
