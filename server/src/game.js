const testBotSource = require('./test-bot-source.js').bot
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
  return y * size +x
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

function getCarSpeed(xPos, yPos, mapSize, tileGrid) {
  const xTile = ~~(xPos / tileSize)
  const yTile = ~~(yPos / tileSize)
  const idx = getIdx(xTile, yTile, mapSize)
  const tile = tileGrid[idx]
  return tile ? 0.7 : 0.35
}

function updateCar(client, tileGrid, map) {
  let keys = client.getInputForFrame(client.car, map, tileGrid)
  let car = client.car
  let speed = getCarSpeed(car.x, car.y, mapSize, tileGrid) * carSpeedMultiplier
  moveCar(car, speed, keys.leftDown, keys.rightDown)
}

const updateAllCars = (tileGrid, clients, map) => () => {
  // tad wasteful to build the array on each frame, but whatever
  let cars = []
  clients.forEach(client => {
    updateCar(client, tileGrid, map)
    cars.push(client.car)
  })
  clients.forEach(client => client.sendState(cars))
}

function newGame(clients) {

  let newMap = generateMap()
  let grid = initializeGrid(newMap, mapSize)

  let settings = {
    mapSize,
    tileSize
  }
  const botSource = testBotSource(settings)
  const bot = botClient(botSource)
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
    })
  })

  // NYI end game loop
  const key = setInterval(updateAllCars(grid, clients, newMap), tickrate)
}

module.exports = {
  newGame
}