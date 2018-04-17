module.exports = (car, map, grid, xt, yt, t, nt, degNext) => {
    if (t) {
        if (!nt) return { ld: true, rd: false } // if we lose the road, just spin around
        if (degNext > car.rotationDeg) {
            return { ld: true, rd: false }
        } else if (degNext < car.rotationDeg) {
            return { ld: false, rd: true }
        }
    }
}