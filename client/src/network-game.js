'use strict';
import './style.scss';

import carImgPath from './img/car.png'
import carImgBlue from './img/car-blue.png'
import carImgGreen from './img/car-green.png'
import carImgPink from './img/car-pink.png'
import carImgRed from './img/car-red.png'

import io from 'socket.io-client'
import settings from './settings.js'

// mabby don't do this tho?
//import {selected} from './react/selection.jsx'

let socket = io(settings.backend)

document.querySelector('#app').innerHTML = '<h1> Hola! </h1>'

// These ugly globals tho. Fix later... :)
const map_canvas = document.getElementById("map");
const map_context = map_canvas.getContext("2d");
const car_canvas = document.getElementById("car");
const car_context = car_canvas.getContext("2d");
let carSizeX = 50
let carSizeY = 30
let g_tileSize
let g_mapSize
let g_tickrate
let g_carStartPos
const carSpeed = 2.0
const rotationSpeed = Math.PI / 60
let carImg
let carImagePaths = [carImgPath, carImgBlue, carImgGreen, carImgPink, carImgRed]
let carImgs = {}
let tileGrid
let stateBuffer = []
let ownCar
let ownCarImage
let carImageMap = {}

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
  map_context.rect(tile.x * g_tileSize, tile.y * g_tileSize, 50, 50)
  map_context.fillStyle = "green"
  map_context.fill()
}

function drawStartTile(tile) {
  map_context.beginPath()
  map_context.rect(tile.x * g_tileSize, tile.y * g_tileSize, 50, 50)
  map_context.fillStyle = "red"
  map_context.fill()
}

function drawEndTile(tile) {
  map_context.beginPath()
  map_context.rect(tile.x * g_tileSize, tile.y * g_tileSize, 50, 50)
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
  let grid = new Array(g_mapSize)
  map.forEach(tile => {
    grid[getIdx(tile.x, tile.y, size)] = tile
  })
  return grid
}

function initialize({tickrate, map, mapSize, tileSize, carSize, carStartPos, car, allCars}) {
  ownCar = car
  stateBuffer = []
  g_tickrate = tickrate
  g_tileSize = tileSize 
  carSizeX = carSize.x
  carSizeY = carSize.y
  g_carStartPos = carStartPos
  g_mapSize = mapSize
  let grid = initializeGrid(map, mapSize)

  //lets just make it 'global' for now. ugly af
  tileGrid = grid

  map_context.clearRect(0, 0, map_canvas.width, map_canvas.height);  // clear canvas
  drawBackgroundGrid()
  drawTiles(map)
  initCar(ownCar, allCars)

  setInterval(updateCar, g_tickrate)
}

function initCar(ownCar, allCars) {
  allCars.forEach((car, idx) => {
    let i = new Image()
    i.src = carImagePaths[idx]
    i.onload = () => {
      console.log(car.idx, ownCar.idx)
      if(car.idx === ownCar.idx) {
        document.querySelector('#owncar').src = carImagePaths[idx]
      }
      car_context.drawImage(i, 0, 0, carSizeX, carSizeY)
      car_context.translate(g_carStartPos.x - carSizeX / 2, g_carStartPos.y - carSizeY / 2)
    }
    car.image = i
    carImageMap[car.idx] = i
  })
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

function updateCar() {
  socket.emit('input', { leftDown, rightDown })
  let state = stateBuffer.pop()
  if (state) {
    car_context.clearRect(-carSizeX, -carSizeY, car_canvas.width + carSizeX, car_canvas.height + carSizeY);  // clear canvas
    state.forEach(car => drawCar(car, carImageMap[car.idx]))
  }
}

function drawCar(car, img) {
  car_context.save()

  let xPos = car.x
  let yPos = car.y
  car_context.translate(xPos, yPos)

  let rotation = car.rotation
  car_context.rotate(-rotation);

  car_context.drawImage(img, -carSizeX/2, -carSizeY/2, carSizeX, carSizeY);

  car_context.restore()
}

window.addEventListener('keydown', checkKeyDown, false)
window.addEventListener('keyup', checkKeyUp, false)

socket.on('new game', (stuff) => console.log(stuff) || initialize(stuff)) 

socket.on('state', car => {
  stateBuffer.push(car)
})

socket.on('end', car => {
  //reset to initial position
  car_context.translate(-(g_carStartPos.x - carSizeX / 2), -(g_carStartPos.y - carSizeY / 2))
  if(car.idx === ownCar.idx) {
    document.querySelector('#app').innerHTML = `<h1> You won! </h1>`
  } else {
    document.querySelector('#app').innerHTML = `<h1> car ${car.idx} won (not you :) </h1>`
  }
  // somebody won
})