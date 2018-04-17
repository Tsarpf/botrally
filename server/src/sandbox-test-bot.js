if (t) {
    if (!nt) exit({ ld: true, rd: false }) // if we lose the road, just spin around
    if (degNext > car.rotationDeg) {
        exit({ ld: true, rd: false })
    } else if (degNext < car.rotationDeg) {
        exit({ ld: false, rd: true })
    }
}
exit()