let client = socket => {
    let inputQueue = {q: []}
    socket.on('input', input => {
        inputQueue.q.push(input)
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
    if (this.inputQueue.q.length > 0) {
        return this.inputQueue.q.pop()
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