import App from './react/app.jsx'
//const App = require './react/app.jsx'

const networked = true
let game
if(networked) {
  game = require('./network-game.js')
} else {
  game = require('./local-game.js')
}