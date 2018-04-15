let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let {newClient} = require('./lobby.js')
let client = require('./client.js')


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  newClient(client(socket))
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});