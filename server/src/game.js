const fs = require('fs')
const testBotSource = require('./test-bot-source.js')
const testSandboxSource = fs.readFileSync('./src/sandbox-test-bot.js', 'utf8')
const botClient = require('./bot-client.js')
const botSpectatorClient = require('./bot-spectator-client.js')
const humanClient = require('./client.js')

const Car = require('./car.js')
const presetMap = require('./placeholder-map.js').map

const {getDriver} = require('./drivers.js')

const carSpeedRoad = 9.0
const carSpeedOffRoad = 7.0
const dragMultiplier = 0.5
const mapSize = 10
const tickrate = 50
const tileSize = 50
let carSize = {
  x: 50,
  y: 30
}

const carSpeedMultiplier = 0.1
const rotationSpeed = Math.PI / 25

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

function addDrag(car, carSpeed) {
  const drag = carSpeed * dragMultiplier
  if(car.velocity.x > 0) {
     car.velocity.x -= 1/carSpeed * dragMultiplier 
     if(car.velocity.x < 0) {
       car.velocity.x = 0
     }
  } else if(car.velocity.x < 0) {
    car.velocity.x += 1/carSpeed * dragMultiplier 
     if(car.velocity.x > 0) {
       car.velocity.x = 0
     }
  }

  if(car.velocity.y > 0) {
     car.velocity.y -= 1/carSpeed * dragMultiplier 
     if(car.velocity.y < 0) {
       car.velocity.y = 0
     }
  } else if(car.velocity.y < 0) {
    car.velocity.y += 1/carSpeed * dragMultiplier 
     if(car.velocity.y > 0) {
       car.velocity.y = 0
     }
  }
}

function moveCar(car, carSpeed, leftDown, rightDown) {
  if(!car) {return} //the function is sometimes called after game has ended and car has been destroyed... :)
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

  addDrag(car, carSpeed)

  car.velocity.x = car.velocity.x + Math.sin(rotation) * carSpeed
  car.velocity.y = car.velocity.y + Math.cos(rotation) * carSpeed
  xPos += car.velocity.y
  yPos -= car.velocity.x

  car.setPosition(xPos, yPos)
}

const randomDir = () => ~~(Math.random() * 3) - 1;
const clamp = (min, max, v) => Math.max(Math.min(max, v), min);

function canPlaceTile(map, x, y, mapSize) {
  if (x < 0 || x >= mapSize || y < 0 || y >= mapSize) {
    // out of bounds
    return false;
  }

  if(map[getIdx(x, y, mapSize)]) {
    // tile exists
    return false;
  }

  return true;
}

function generateTile(map, prevX, prevY) {
  for (let i = 0; i < 10; i++) {
    let xDir = randomDir();
    let yDir = randomDir();

    // no purely diagonal tiles
    if (xDir != 0 && yDir != 0) {
      if (Math.random() <= 0.5) {
        xDir = 0;
      } else {
        yDir = 0;
      }
    }

    let x = prevX + xDir;
    let y = prevY + yDir;

    if (canPlaceTile(map, x, y, mapSize)) {
      return { x, y, type: "hurr durr" };
    }
  }

  // fuck it, can't put anything here
  return null;
}

const tileDistance = (tile) => Math.sqrt(tile.x * tile.x + tile.y * tile.y);

function generateMap() {
  let map = new Array(mapSize * mapSize);

  map[0] = { x: 0, y: 0, type: "start"};

  let prevX = 0, prevY = 0;

  while (true) {
    let tile = generateTile(map, prevX, prevY);

    if (!tile) {
      break;
    }

    tile.type = "road";
    map[getIdx(tile.x, tile.y, mapSize)] = tile;
    prevX = tile.x;
    prevY = tile.y;
  }

  map = map.filter(v => v);
  let maxDistance = 0;
  let mostDistantTile = null;

  for (let tile of map) {
    let curDistance = tileDistance(tile);
    if (curDistance > maxDistance) {
      mostDistantTile = tile;
      maxDistance = curDistance;
    }
  }

  mostDistantTile.type = "end";

  return map;
}


function checkVictoryCondition(xTile, yTile, mapSize, tileGrid) {
  const idx = getIdx(xTile, yTile, mapSize)
  const tile = tileGrid[idx]
  return tile ? tile.type === 'end' ? true : false : false
}

function getCarSpeed(xTile, yTile, mapSize, tileGrid) {
  const idx = getIdx(xTile, yTile, mapSize)
  const tile = tileGrid[idx]
  return tile ? carSpeedRoad : carSpeedOffRoad 
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
  if (!map[idx]) return {}
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

async function updateCar(client, tileGrid, map, settings, movingAllowed) {
  let xt = tile(client.car.x, settings.tileSize)
  let yt = tile(client.car.y, settings.tileSize)
  let t = getTile(xt, yt, tileGrid, settings.mapSize)
  client.car.rotationDeg = (client.car.rotation / Math.PI / 2 * 360) % 360
  
  let nextAndDeg = getDegToNextTile(xt, yt, t, map)
  let nt = nextAndDeg.nt
  let degNext = nextAndDeg.degNext

  let input
  try {
    input = await client.getInputForFrame(client.car, map, tileGrid, xt, yt, t, nt, degNext)
  } catch(e) {
    //console.log('failed to get input', e)
  }
  let keys = fixBotShortHands(client, input)

  let car = client.car
  let speed = getCarSpeed(xt, yt, mapSize, tileGrid) * carSpeedMultiplier
  if(!movingAllowed) speed = 0
  moveCar(car, speed, keys.leftDown, keys.rightDown)
}

function endGame(clients, loopKey, winner, cb) {
    clients.forEach(c => {
      delete c.car
      if (c.type === 'human') { c.inputQueue.q = [] }
      c.sendWinner(winner)
    })
    clearInterval(loopKey)
    cb(clients)
}

async function newGame(clients, cb) {
  let loopKey
  let endTimer
  let movingAllowed = false
  const updateAllCars = (tileGrid, clients, map, settings) => () => {
    // tad wasteful to build the array on each frame, but whatever
    let cars = []
    let winner
    clients.forEach(client => {
      try {
        updateCar(client, tileGrid, map, settings, movingAllowed)
      } catch(e) {
        console.log('updating failed', e)
      }

      let xt = tile(client.car.x, settings.tileSize)
      let yt = tile(client.car.y, settings.tileSize)
      if (checkVictoryCondition(xt, yt, settings.mapSize, tileGrid)) {
        winner = client.car
      }
      cars.push(client.car)
    })
    if (winner) { 
      clearTimeout(endTimer)
      endGame(clients, loopKey, winner, cb)
    } else {
      clients.forEach(client => client.sendState(cars))
    } 
  }

  let newMap = generateMap()
  let grid = initializeGrid(newMap, mapSize)

  let settings = {
    mapSize,
    tileSize,
    carStartPos: {x: carSize.x / 2, y: carSize.y / 2}
  }

  const driverSelection = clients.map(c => c.getDriver())

  clients = (await Promise.all(driverSelection)).map(d => setupDriver(d))

  // lets add one bot player for fun
  const bot = botClient(testSandboxSource)
  //const bot = botClient(testBotSource)
  clients.unshift(bot)


  clients.forEach(client => {
    client.car = Car(settings.carStartPos, 0)
  })

  const clientCars = clients.map(c => c.car)

  clients.forEach(client => 
    client.sendNewGame({
      map: newMap,
      tickrate,
      tileSize,
      mapSize,
      carSize,
      carStartPos: settings.carStartPos,
      car: client.car,
      allCars: clientCars
    })
  )
  loopKey = setInterval(updateAllCars(grid, clients, newMap, settings), tickrate)
  setTimeout(() => movingAllowed = true, 1000)
  endTimer = setTimeout(() => endGame(clients, loopKey, null, cb), 60000)
}

function setupDriver(d) {
  if(d.driver !== 'human') {
    return botSpectatorClient(getDriver(d.driver), d.client.socket)
  }
  if(d.driver === 'human') {
    return humanClient(d.client.socket)
  }
  //clients = drivers.map(d => d.client)
  return d.client
}

module.exports = {
  newGame
}