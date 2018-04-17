const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser')
const {newClient} = require('./lobby.js')
const client = require('./client.js')
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors())

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

let bots = {

}

app.get('/bots', (req, res) => {
  res.send(Object.keys(bots))
})

app.post('/new-bot', (req, res) => {
  let source = req.body.source
  let name = req.body.name
  if(!name || !source) {
    console.log('no name or source')
    return res.sendStatus(400)
  }

  if (!bots[name]) {
    bots[name] = source
  }
  res.end()
})

io.on('connection', function(socket){
  newClient(client(socket))
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

