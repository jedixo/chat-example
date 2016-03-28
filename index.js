var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

//variables
var port = 3000;
var ids = 0;
var activeUsers = [];
var serverMsg;

//forwards chat html to clients
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

// connection listener
io.on('connection', function(socket){
	ids++;
	serverMsg = 'Server: User ' + ids + ' connected.'

	// sets up user and gets active users
	io.emit('user id', ids);
	io.emit('server message',serverMsg);
	getActiveUsersRequest();
	
	
	// logging chat
	log(serverMsg);
	
	//Disconnect event
	socket.on('disconnect', function(){
		serverMsg = 'Server: a user has left.';
		
		// reseting user count
		io.emit('server message',serverMsg);
		getActiveUsersRequest();
		
		// logging chat
		log(serverMsg);
	});
	
	//client lets the server know it's connected and sends all clients an active user list
	socket.on('active user',function(msg) {
		activeUsers.push(msg);
		io.emit('currently active users', activeUsers)
		
		//logging
		log(activeUsers);
	});
  
    //server receives message and sends it to all clients
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
		
		//logging chat
		log(msg);
	});
	
	//client changes name and lets server know 
	socket.on('nickname changed', function(msg) {
		serverMsg = 'Server: ' + msg.old + ' changed their name to ' + msg.new;
		
		
		io.emit('server message', serverMsg);
		getActiveUsersRequest();
		
		// logging chat
		log(serverMsg);
	});
});

//port listener
http.listen(port, function(){
	console.log('listening on *:' + port);
});

//writes log to log.txt on filesystem and to console
function log(msg) {
	console.log(msg);
	fs.appendFile('log.txt',msg + '\n');
}

//sets active user names
function getActiveUsersRequest() {
	activeUsers = [];
	io.emit('get active users');
}
