// TODO: get map specs as a parameter
const mapSize = 10
const tileSize = 50

const bot = settings => {
    const tile = (pos, tileSize) => ~~(pos / tileSize)
    const getIdx = (x, y, size) => {
        return y * size + x
    }
    const getTile = (x, y) => grid[getIdx(x, y)]
    return (car, map, grid, settings) => {
        let xt = tile(car.x, settings.tileSize)
        let yt = tile(car.y, settings.tileSize)
        let t = getTile(xt, yt, settings.mapSize)
        if (t) {
            let idx = 0
            while(map[idx] !== t) {
                idx++
            }
            idx++
            console.log('next tile is ', map[idx])

            // TODO: compute angle to next tile
            // TODO: turn towards if angle is not 0
        }

        return { leftDown: false, rightDown: false }
    }
}

module.exports = {
    bot
}




// API ideas:
// - function that tells which part of the road we're now
// -