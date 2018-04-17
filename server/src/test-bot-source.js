const bot = settings => {
    return (car, map, grid, xt, yt, t) => {
        if (t) {
            let idx = 0
            while(map[idx] !== t) {
                idx++
            }
            idx++
            if(!map[idx]) return { leftDown: true, rightDown: false } // if we lose the road, just spin around
            const nextTile = map[idx]
            const rad = Math.atan2(nextTile.x - xt, nextTile.y - yt)
            const deg = rad * (180 / Math.PI) - 90 // -90 because we want towards right to be 0
            if(deg > car.rotationDeg) {
                return { leftDown: true, rightDown: false }
            } else if (deg < car.rotationDeg){
                return { leftDown: false, rightDown: true}
            } else {
                return { leftDown: false, rightDown: false }
            }
        }
        return { leftDown: true, rightDown: false }
    }
}

module.exports = {
    bot
}




// API ideas:
// - function that tells which part of the road we're now
// -