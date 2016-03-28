var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var users = 0;
var ids = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  users += 1;
  ids++;
  io.emit('user id', ids);
  io.emit('server message','Server: ' + users + ' users connected.');
  append('Server: ' + users + ' users connected.');
  console.log(users + ' users connected');
  socket.on('disconnect', function(){
    users -= 1;
    io.emit('server message','Server: a user has left.');
	append('Server: a user has left.');
    console.log(users + ' users connected');
	append('Server: ' + users + ' users connected.');
    io.emit('server message','Server: ' + users + ' users connected.');
  });
  socket.on('chat message', function(msg){
	append(msg);
    io.emit('chat message', msg);
  });
  socket.on('nickname changed', function(msg) {
	append('Server: ' + msg.old + ' changed their name to ' + msg.new);
    io.emit('server message', 'Server: ' + msg.old + ' changed their name to ' + msg.new);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function append(msg) {
	fs.appendFile('log.txt',msg + '\n');
}
