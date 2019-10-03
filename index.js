const express = require('express')
var app = express()

// this links to the knexfile to select different db configurations
const dbConfigs = require('./knexfile.js')

// selection development config from the knexfile
const db = require('knex')(dbConfigs.development)

// set the port to listen on 
const port = 3000

// listen for incoming requests on the '/' page
app.get('/', function (req, res) {
    
    // runs function to get all the cohorts from the database, 
    // then sends them to the browser for rendering
    getAllCohorts()
    .then(function(allCohorts) {
        // res.send('<pre>' + JSON.stringify(allCohorts, null, 4) + '</pre>')
        res.send('<ul>' + allCohorts.map(renderCohort).join('') + '</ul>')
    })
})

// listens for requests for a particular cohort slug,
// then renders the data as a JSON string
app.get('/cohorts/:slug', function (req, res) {
    
    getOneCohort(req.params.slug)
    .then(function(cohorts) {
        if (cohorts.length === 1){
            res.send('<pre>' + JSON.stringify(cohorts) + '</pre>')
        } else {
            res.status(404).send('cohort not found :(')
        }
    })
})
// this activates listening on the defined port
app.listen(3000, function () { 
    console.log('listening on port ' + port)
})

// this is storying a basic SQL query in a variable to be used elsewhere
const getAllCohortsQuery = `
    SELECT *
    FROM Cohorts
`
// this returns all the cohorts from the db using a raw SQL string 
// which is stored in the getAllCohortsQuery variable
function getAllCohorts () {
    return db.raw(getAllCohortsQuery)
}
// this function pulls one cohort based on the slug
// which is supplied as a function parameter
function getOneCohort (slug) {
    return db.raw("SELECT * FROM Cohorts WHERE slug = ?", [slug])
}

// takes the cohort slug and renders it into a link
function renderCohort (cohort) {
    return `
    <li><a href="/cohorts/${cohort.slug}">${cohort.title}</a></li>
    `
}

// db.raw(getAllCohortsQuery)
//     .then(function (result) {
//         console.log("db result:")
//         console.log(result)
//     })
