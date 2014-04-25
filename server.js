var 
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

var socketIO = require('socket.io-client');
var socket = socketIO.connect('http://nodeplayscar.herokuapp.com/');
  
  socket.on('tmovement', function(direction) {
    tdirection[direction]();
  });
  socket.on('tspeed', function(speed) {
    tspeed[speed]();
  });
  socket.on('test', function(data) {
    console.log(data);
  });
