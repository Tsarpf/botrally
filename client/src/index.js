'use strict';
import './style.scss';

import carImgPath from './img/car.png'

// randomly using ES7 object rest spread because it currently raises
// an error in all browsers, but can be transpiled by Babel
const { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 }
const n = { x, y, ...z }
if (Object.keys(n).map((key) => n[key]).reduce((p, v) => p + v) === 10) {
  document.querySelector('#app').insertAdjacentHTML('afterbegin', '<h1>hola.</h1>')
}

const map_canvas = document.getElementById("map");
const map_context = map_canvas.getContext("2d");

const car_canvas = document.getElementById("car");
const car_context = car_canvas.getContext("2d");
let carSizeX = 50
let carSizeY = 30

const tileSize = 50
const mapSize = 10

const updateSpeed = 10

let carImg

// will be transmitted from server in the future, hence the stupid name
const paramMap = [
  {
    x: 0,
    y: 0,
    type: 'start'
  },
  {
    x: 1,
    y: 0,
    type: 'road'
  },
  {
    x: 2,
    y: 0,
    type: 'road'
  },
  {
    x: 2,
    y: 1,
    type: 'road'
  },
  {
    x: 2,
    y: 2,
    type: 'road'
  },
  {
    x: 3,
    y: 2,
    type: 'road'
  },
  {
    x: 3,
    y: 3,
    type: 'road'
  },
  {
    x: 4,
    y: 3,
    type: 'road'
  },
  {
    x: 4,
    y: 4,
    type: 'road'
  },
  {
    x: 5,
    y: 4,
    type: 'road'
  },
  {
    x: 5,
    y: 4,
    type: 'road'
  },
  {
    x: 5,
    y: 5,
    type: 'road'
  },
  {
    x: 6,
    y: 5,
    type: 'road'
  },
  {
    x: 6,
    y: 6,
    type: 'road'
  },
  {
    x: 7,
    y: 6,
    type: 'road'
  },
  {
    x: 7,
    y: 7,
    type: 'road'
  },
  {
    x: 8,
    y: 7,
    type: 'road'
  },
  {
    x: 8,
    y: 8,
    type: 'road'
  },
  {
    x: 9,
    y: 8,
    type: 'road'
  },
  {
    x: 9,
    y: 9,
    type: 'end'
  },
]

function drawBackgroundGrid() {
  const sizeX = 501
  const sizeY = 501
  for (var x = 0.5; x < sizeX; x += 50) {
    map_context.moveTo(x, 0);
    map_context.lineTo(x, 501);
  }

  for (var y = 0.5; y < sizeY; y += 50) {
    map_context.moveTo(0, y);
    map_context.lineTo(501, y);
  }

  map_context.moveTo(0, 0);
  map_context.lineTo(501, 501);

  map_context.strokeStyle = "#ddd";
  map_context.stroke();
}

function drawRoadTile(tile) {
  map_context.beginPath()
  map_context.rect(tile.x * tileSize, tile.y * tileSize, 50, 50)
  map_context.fillStyle = "green"
  map_context.fill()
}

function drawStartTile(tile) {
  map_context.beginPath()
  map_context.rect(tile.x * tileSize, tile.y * tileSize, 50, 50)
  map_context.fillStyle = "red"
  map_context.fill()
}

function drawEndTile(tile) {
  map_context.beginPath()
  map_context.rect(tile.x * tileSize, tile.y * tileSize, 50, 50)
  map_context.fillStyle = "blue"
  map_context.fill()
}

function drawTiles(tiles) {
  tiles.forEach(tile => {
    switch(tile.type) {
      case 'start':
        drawStartTile(tile)
        break
      case 'end':
        drawEndTile(tile)
        break
      case 'road':
        drawRoadTile(tile)
        break
      default: throw Error('wat')
    }
  })
}

function getIdx(x, y, size) {
  return y * size +x
}

function initializeGrid(map, size) {
  let grid = new Array(mapSize)
  map.forEach(tile => {
    grid[getIdx(tile.x, tile.y, size)] = tile
  })
  return grid
}

let tileGrid
function initialize(mapSize, tileSize, map) {
  let grid = initializeGrid(map, mapSize)

  //lets just make it 'global' for now
  tileGrid = grid

  drawTiles(map)
  initCar()
}

function initCar() {
  carImg = new Image()
  carImg.src = carImgPath
  carImg.onload = () => {
    car_context.drawImage(carImg, 0, 0, 50, 30);
    car_context.translate(carSizeX / 2, carSizeY / 2)
    setInterval(updateCar, updateSpeed)
  }
}

let leftDown = false
let rightDown = false
function checkKeyDown(e) {
  var code = e.keyCode;
  switch (code) {
    case 37:
      leftDown = true
      break;
    case 39:
      rightDown = true
      break
    default: console.log(code);
  }
}
function checkKeyUp(e) {
  var code = e.keyCode;
  switch (code) {
    case 37:
      leftDown = false
      break;
    case 39:
      rightDown = false
      break
    default: console.log(code);
  }
}

let xPos = 0
let yPos = 0
let rotation = 0

function getCarSpeed(xPos, yPos, mapSize) {
  const xTile = ~~(xPos / 50)
  const yTile = ~~(yPos / 50)
  const idx = getIdx(xTile, yTile, mapSize)
  const tile = tileGrid[idx]
  return tile ? 0.7 : 0.35
}

function updateCar() {
  let speed = getCarSpeed(xPos, yPos, mapSize)
  drawCar(speed)
}

function drawCar(carSpeed) {
  car_context.save()

  car_context.clearRect(-carSizeX, -carSizeY, car_canvas.width + carSizeX, car_canvas.height + carSizeY);  // clear canvas

  car_context.translate(xPos, yPos)

  let rotationSpeed = Math.PI / 125
  if(leftDown)
  {
    rotation += rotationSpeed
  }
  if(rightDown)
  {
    rotation -= rotationSpeed
  }
  car_context.rotate(-rotation);

  const xSpeed = Math.sin(rotation) * carSpeed
  const ySpeed = Math.cos(rotation) * carSpeed
  xPos += ySpeed
  yPos -= xSpeed

  car_context.drawImage(carImg, -carSizeX/2, -carSizeY/2, carSizeX, carSizeY);

  car_context.restore()
}

window.addEventListener('keydown', checkKeyDown, false)
window.addEventListener('keyup', checkKeyUp, false)

drawBackgroundGrid()
initialize(mapSize, tileSize, paramMap)