let client = socket => {
    let inputQueue = []
    socket.on('input', input => {
        inputQueue.push(input)
    })
    return {
        socket,
        sendNewGame,
        getInputForFrame,
        inputQueue,
        sendState,
        type: 'human',
        sendWinner
    }
}

function getInputForFrame() {
    if(this.inputQueue.length > 0) {
        return this.inputQueue.pop()
    }
    return { leftDown: false, rightDown: false }
}

function sendNewGame(newGameData) {
    this.socket.emit('new game', newGameData)
}

function sendState(state) {
    this.socket.emit('state', state)
}

function sendWinner(winnerCar) {
    this.socket.emit('end', winnerCar)
}

module.exports = client