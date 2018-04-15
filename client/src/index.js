const networked = true

let game
if(networked) {
  game = require('./network-game.js')
} else {
  game = require('./local-game.js')
}