const {newGame} = require('./game.js')
const clientsPerGame = 2

let waitingClients = []
function newClient(client) {
    waitingClients.push(client)
    checkIfShouldStartGame()
}

function checkIfShouldStartGame() {
    if(waitingClients.length >= clientsPerGame) {
        startNewGame(clientsPerGame)
    }
}

function startNewGame(numPlayers) {
    let clients = waitingClients.splice(0, numPlayers)

    console.log('starting new game with clients: ', clients, numPlayers)

    newGame(clients)
}


module.exports = {
    newClient
}