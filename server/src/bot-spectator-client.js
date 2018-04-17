const Promise = require('bluebird')

const sbox = require('./sandcastle.js')

let client = (source, socket) => {
    return {
        socket,
        source,
        getDriver,
        sendNewGame,
        getInputForFrame,
        sendState,
        type: 'bot',
        sendWinner
    }
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

const createScript = (source) => sbox.createScript("exports.main = function() {" + source + "}");

function getInputForFrame(car, map, tileGrid, xt, yt, t, nt, degNext) {
    return new Promise((resolve, reject) => {
        let script = createScript(this.source)
        script.on('exit', (err, output) => {
            if (err) {
                reject(err)
            } else {
                resolve(output)
            }
        })
        script.on('timeout', () => reject('timeout'))
        script.run({
            car,
            map,
            grid: tileGrid,
            xt,
            yt,
            t: t ? t : false,
            nt,
            degNext
        })
    })
}

module.exports = client