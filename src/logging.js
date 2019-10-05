
function now () {
    const d = new Date()
    return d.toISOString()
}

function info (msg) {
    console.log('[' + now() + ']  INFO: ' + msg)
}

function error (msg) {
    console.log('[' + now() + '] ERROR: ' + msg)
}

function warn (msg) {
    console.log('[' + now() + ']  WARN: ' + msg)
}


// ---------------------------------
// Public API

module.exports = {
    info: info,
    warn: warn,
    error: error,
}