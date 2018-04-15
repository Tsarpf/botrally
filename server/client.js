let client = socket => {
    let inputQueue = []
    socket.on('input', input => {
        inputQueue.push(input)
    })
    return {
        socket,
        sendNewMap,
        getInputForFrame,
        inputQueue,
        sendState
    }
}

function getInputForFrame() {
    if(this.inputQueue.length > 0) {
        return this.inputQueue.pop()
    }
    console.log('no input')
    //return null
    return { leftDown: false, rightDown: false }
    // NYI wait for input
}

function sendNewMap(map) {
    this.socket.emit('map', map)
}

function sendState(state) {
    this.socket.emit('state', state)
}

module.exports = client