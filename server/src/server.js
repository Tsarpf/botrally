const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser')
const {newClient} = require('./lobby.js')
const client = require('./client.js')
const cors = require('cors')
const fs = require('fs')
const {addDriver, drivers} = require('./drivers.js')

app.use(bodyParser.json())
app.use(cors())

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/bots', (req, res) => {
  res.send(Object.keys(drivers))
})

app.post('/new-bot', (req, res) => {
  let source = req.body.source
  let name = req.body.name
  if(!name || !source) {
    console.log('no name or source')
    return res.sendStatus(400)
  }
  if(!source.length || source.length > 10000 || !name.length || name.length > 10000) {
    console.log('too hueg')
    return res.sendStatus(413)
  }
  addDriver(req.body)

  res.end()
})

io.on('connection', function(socket){
  newClient(client(socket))
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

