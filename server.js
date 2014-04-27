var 
  serialport = require("serialport"),
  SerialPort = serialport.SerialPort, // localize object constructor
  fs = require('fs'),
  socketIO = require('socket.io-client');

//SERIAL
var portName = '/dev/ttyUSB0';
var serial = new SerialPort(portName, {
  baudRate: 9600,
  dataBits: 8, 
  parity: 'none', 
  stopBits: 1, 
  flowControl: false,
  parser: serialport.parsers.raw
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

function location() {
  serial.write(':GC#', function(err, callback) {
    console.log('err: ' + err + 'callback: ' + callback);
  }
)};

var dest = {
  dec: function () { serial.write(':Sas90*53#'); },
  go: function () { serial.write(':MA#'); }
};

// serial.on('data', function(data) {
//   console.log(data);
// });

var socket = socketIO.connect('107.170.68.139:5000') 
  socket.on('connect', function(){
  socket.on('tmove', function(direction) {
    tdirection[direction]();
    //location();
  });
  socket.on('tspeed', function(speed) {
    tspeed[speed]();
  });
  socket.on('test', function(data) {
    console.log(data);
    
  });

  });