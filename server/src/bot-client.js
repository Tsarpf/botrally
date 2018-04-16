let client = source => {
    return {
        source,
        sendNewGame,
        getInputForFrame,
        sendState,
        type: 'bot'
    }
}

function getInputForFrame(car, map, grid) {
    return this.source(car, map, grid)
    //if(this.inputQueue.length > 0) {
    //    return this.inputQueue.pop()
    //}
    //console.log('no input')
    ////return null
    //return { leftDown: false, rightDown: false }
    //// NYI wait for input
}

function sendNewGame(newGameData) {
    // should the bots have an initialization function?
    // why bother tho?


    //this.socket.emit('new game', newGameData)
}

function sendState(state) {
    // noop

    //this.socket.emit('state', state)
}

module.exports = client