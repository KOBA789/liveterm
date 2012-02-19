var noop = function () { /* do nothing */ };

var socket = io.connect();

var term = new Terminal(80, 30, noop);

socket.on('connect', function () {
  term.open();
  socket.emit('create');
});

socket.on('data', function (data) {
  term.write(data);
});