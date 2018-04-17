const testBotSource = require('./test-bot-source.js')
const botClient = require('./bot-client.js')

const Car = require('./car.js')
const presetMap = require('./placeholder-map.js').map

const mapSize = 10
const tickrate = 30
const tileSize = 50
let carSize = {
  x: 50,
  y: 30
}

const carSpeedMultiplier = 2.5
const rotationSpeed = Math.PI / 30


function initializeGrid(map, size) {
  let grid = new Array(mapSize)
  map.forEach(tile => {
    grid[getIdx(tile.x, tile.y, size)] = tile
  })
  return grid
}

function getIdx(x, y, size) {
  return y * size + x
}

function moveCar(car, carSpeed, leftDown, rightDown) {
  let rotation = car.rotation
  let xPos = car.x
  let yPos = car.y

  if(leftDown)
  {
    rotation += rotationSpeed
  }
  if(rightDown)
  {
    rotation -= rotationSpeed
  }
  car.setRotation(rotation);

  const xSpeed = Math.sin(rotation) * carSpeed
  const ySpeed = Math.cos(rotation) * carSpeed
  xPos += ySpeed
  yPos -= xSpeed

  car.setPosition(xPos, yPos)
}

function generateMap() {
  // NYI
  return presetMap // just use map from file for now
}


function checkVictoryCondition(xTile, yTile, mapSize, tileGrid) {
  const idx = getIdx(xTile, yTile, mapSize)
  const tile = tileGrid[idx]
  return tile ? tile.type === 'end' ? true : false : false
}

function getCarSpeed(xTile, yTile, mapSize, tileGrid) {
  const idx = getIdx(xTile, yTile, mapSize)
  const tile = tileGrid[idx]
  return tile ? 0.7 : 0.35
}

const getTile = (x, y, grid, size) => grid[getIdx(x, y, size)]
const tile = (pos, tileSize) => ~~(pos / tileSize)

function getDegToNextTile(xt, yt, t, map) {
  if (!t) return {}

  let idx = 0
  while (map[idx] !== t) {
    idx++
  }
  idx++
  if (!map[idx]) return { leftDown: true, rightDown: false } // if we lose the road, just spin around
  const nextTile = map[idx]
  const rad = Math.atan2(nextTile.x - xt, nextTile.y - yt)
  const deg = rad * (180 / Math.PI) - 90 // -90 because we want towards right to be 0
  return {nt: nextTile, degNext: deg}
}

function fixBotShortHands(client, keys) {
  if(client.type === 'bot') {
    keys = keys ? {leftDown: keys.ld, rightDown: keys.rd} : {leftDown: false, rightDown: false}
  }
  return keys
}

function updateCar(client, tileGrid, map, settings) {
  let xt = tile(client.car.x, settings.tileSize)
  let yt = tile(client.car.y, settings.tileSize)
  let t = getTile(xt, yt, tileGrid, settings.mapSize)
  client.car.rotationDeg = (client.car.rotation / Math.PI / 2 * 360) % 360
  
  let nextAndDeg = getDegToNextTile(xt, yt, t, map)
  let nt = nextAndDeg.nt
  let degNext = nextAndDeg.degNext

  let keys = fixBotShortHands(client, client.getInputForFrame(client.car, map, tileGrid, xt, yt, t, nt, degNext))

  let car = client.car
  let speed = getCarSpeed(xt, yt, mapSize, tileGrid) * carSpeedMultiplier
  moveCar(car, speed, keys.leftDown, keys.rightDown)
}

function endGame(clients, loopKey, winner, cb) {
    clients.forEach(c => {
      delete c.car
      c.inputQueue = []
      c.sendWinner(winner)
    })
    clearInterval(loopKey)
    cb(clients)
}

function newGame(clients, cb) {
  let loopKey
  const updateAllCars = (tileGrid, clients, map, settings) => () => {
    // tad wasteful to build the array on each frame, but whatever
    let cars = []
    let winner
    clients.forEach(client => {
      updateCar(client, tileGrid, map, settings)

      let xt = tile(client.car.x, settings.tileSize)
      let yt = tile(client.car.y, settings.tileSize)
      if (checkVictoryCondition(xt, yt, settings.mapSize, tileGrid)) {
        winner = client.car
      }
      cars.push(client.car)
    })
    if (winner) { 
      endGame(clients, loopKey, winner, cb)
    } else {
      clients.forEach(client => client.sendState(cars))
    } 
  }

  let newMap = generateMap()
  let grid = initializeGrid(newMap, mapSize)

  let settings = {
    mapSize,
    tileSize
  }
  const bot = botClient(testBotSource)
  // lets add one bot player for fun
  clients.push(bot)

  clients.forEach(client => {
    let carStartPos = {x: carSize.x / 2, y: carSize.y / 2}
    client.car = Car(carStartPos, 0)
    client.sendNewGame({
      map: newMap,
      tickrate,
      tileSize,
      mapSize,
      carSize,
      carStartPos,
      car: client.car
    })
  })

  loopKey = setInterval(updateAllCars(grid, clients, newMap, settings), tickrate)
}

module.exports = {
  newGame
}