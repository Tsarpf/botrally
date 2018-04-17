const {newGame} = require('./game.js')
const clientsPerGame = 2

let waitingClients = []
function newClient(client) {
    waitingClients.push(client)
    checkIfShouldStartGame()
}

function checkIfShouldStartGame() {
    waitingClients = waitingClients.filter(c => c.socket ? c.socket.connected : false)
    if(waitingClients.length >= clientsPerGame) {
        startNewGame(clientsPerGame)
    }
}

function startNewGame(numPlayers) {
    let clients = waitingClients.splice(0, numPlayers)

    console.log('starting new game with n clients: ', numPlayers)

    newGame(clients, clients => {
        clients.filter(c => c.socket ? c.socket.connected : false).forEach(c => newClient(c))
    })
}


module.exports = {
    newClient
}