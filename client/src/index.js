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

const tileSize = 50

let carImg

const map = [
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

function grid() {

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

  //map_context.beginPath()
  //map_context.rect(0,0,50,50)
  //map_context.fillStyle = "blue"
  //map_context.fill()

  //map_context.beginPath()
  //map_context.rect(450,450,500,500)
  //map_context.fillStyle = "blue"
  //map_context.fill()

  //// draw a fucking map
  //for(var x = 50; x < sizeX; x+= 50) {
  //    map_context.beginPath()
  //    map_context.rect(x,x-50,50,50)
  //    map_context.fillStyle = "green"
  //    map_context.fill()
  //}
  //for(var x = 50; x < sizeX; x+= 50) {
  //    map_context.beginPath()
  //    map_context.rect(x+50,x-50,50,50)
  //    map_context.fillStyle = "green"
  //    map_context.fill()
  //}
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

function drawMap() {
  //TODO: get the map from somewhere
  drawTiles(map)
}

function drawCar() {
  console.log(carImgPath)
  //context.drawImage(carImg, 0, 0);

  carImg = new Image()
  carImg.src = carImgPath
  carImg.onload = () => {
    car_context.drawImage(carImg, 0, 0, 50, 30);
    setInterval(updateCar, 10)
  }
}

let xPos = 0
let yPos = 0
function updateCar() {
  xPos += 1
  yPos += 1
  car_context.clearRect(0, 0, car_canvas.width, car_canvas.height);  // clear canvas
  car_context.drawImage(carImg, xPos, yPos, 50, 30);
}

function checkKeys(e) {
  var code = e.keyCode;
  switch (code) {
    case 37: console.log("Left"); break; //Left key
    case 38: console.log("Up"); break; //Up key
    case 39: console.log("Right"); break; //Right key
    case 40: console.log("Down"); break; //Down key
    default: console.log(code); //Everything else
  }
}

window.addEventListener('keydown', checkKeys, false)

grid()
drawMap()
drawCar()