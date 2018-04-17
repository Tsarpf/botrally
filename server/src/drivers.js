const fs = require('fs')
let drivers = JSON.parse(fs.readFileSync('./drivers.json', "utf8"))
function addDriver(driver) {
    if(!drivers[driver.name]) {
        drivers[driver.name] = driver.source
    }
    fs.writeFileSync('./drivers.json', JSON.stringify(drivers))
}

function getDriver(driver) {
    return drivers[driver]
}

module.exports = {
    addDriver,
    getDriver,
    drivers
}