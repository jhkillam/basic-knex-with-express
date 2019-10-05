const log = require('./logging.js')

// this links to the knexfile to select different db configurations
const dbConfigs = require('../knexfile.js')

log.info('Connecting to db........')
// select development config from the knexfile
const db = require('knex')(dbConfigs.development)

db.raw('SELECT 1')
    .then(function(result) {
        log.info('Successfully connected to the database')
    })
    .catch(function(error) {
            log.error('Unable to connect to the database')
    })
// ---------------------------------
// Public API

module.exports = {
    db: db
}