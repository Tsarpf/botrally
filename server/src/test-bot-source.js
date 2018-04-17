const bot = settings => {
    return (car, map, grid, xt, yt, t, nt, degNext) => {
        if (t) {
            if (!nt) return { leftDown: true, rightDown: false } // if we lose the road, just spin around
            if (degNext > car.rotationDeg) {
                return { leftDown: true, rightDown: false }
            } else if (degNext < car.rotationDeg) {
                return { leftDown: false, rightDown: true }
            }
        }
    }
}

module.exports = {
    bot
}




// API ideas:
// - function that tells which part of the road we're now
// -