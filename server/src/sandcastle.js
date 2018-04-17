const SandCastle = require('sandcastle').SandCastle
var sbox = new SandCastle({
    cwd: __dirname,
    /*api: __dirname + '/../lib/api.js',*/
    memoryLimitMB: 1000,
    timeout: 1000,
});

module.exports = sbox