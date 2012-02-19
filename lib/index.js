var PORT = 8124;

var path = require('path'),
    fs = require('fs'),
    http = require('http');

var io = require('socket.io');

var Terminal = require('./term');

var fileServer = new(require('node-static').Server)('../static');

var app = http.createServer(function (req, res) {
  req.on('end', function () {
    fileServer.serve(req, res);
  });
});


var shell = 'tmuxsh';
var termName = 'xterm';

io = io.listen(app);

io.configure(function () {
  io.disable('log');
});

io.sockets.on('connection', function (socket) {
  var terms = [];

  var id = terms.length;

  var term = new Terminal(shell, termName, 80, 30);
  terms.push(term);

  term.on('data', function (data) {
    socket.emit('data', data);
  });

  term.on('close', function () {
    socket.emit('kill');
  });

  console.log(''
              + 'Created shell with pty (%s) master/slave'
              + ' pair (master: %d, pid: %d)',
              term.pty, term.fd, term.pid);

  socket.on('disconnect', function () {
    term.destroy();
    delete terms[id];
  });
});

app.listen(PORT);