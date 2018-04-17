const Promise = require('bluebird')

let client = socket => {
    let inputQueue = {q: []}
    socket.on('input', input => {
        inputQueue.q.push(input)
    })
    return {
        socket,
        getDriver,
        sendNewGame,
        getInputForFrame,
        inputQueue,
        sendState,
        type: 'human',
        sendWinner
    }
}

function getInputForFrame() {
    return new Promise((resolve, reject) => {
        if (this.inputQueue.q.length > 0) {
            resolve(this.inputQueue.q.pop())
        }
        resolve({ leftDown: false, rightDown: false })
    })
}

function sendNewGame(newGameData) {
    this.socket.emit('new game', newGameData)
}

function getDriver() {
    this.socket.emit('getdriver', 'plz')
    return new Promise((resolve, reject) => {
        this.socket.on('driver', driver => {
            resolve({...driver, client: this})
        })
    })
}

function sendState(state) {
    this.socket.emit('state', state)
}

function sendWinner(winnerCar) {
    this.socket.emit('end', winnerCar)
}

module.exports = client