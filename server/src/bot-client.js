let client = source => {
    return {
        source,
        sendNewGame,
        getInputForFrame,
        sendState,
        type: 'bot'
    }
}

function getInputForFrame() {
    return this.source(...arguments)
}

function sendNewGame(newGameData) {
    // should the bots have an initialization function?
    // why bother tho?
}

function sendState(state) {
    // noop
}

module.exports = client