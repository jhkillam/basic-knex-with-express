const express = require('express')
var app = express()

const dbConfigs = require('./knexfile.js')
const db = require('knex')(dbConfigs.development)

const port = 3000

app.get('/', function (req, res) {
    
    getAllCohorts()
        .then(function(allCohorts) {
            // res.send('<pre>' + JSON.stringify(allCohorts, null, 4) + '</pre>')
            res.send('<ul>' + allCohorts.map(renderCohort).join('') + '</ul>')
        })
})

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

app.listen(3000, function () { 
    console.log('listening on port ' + port)
})

const getAllCohortsQuery = `
    SELECT *
    FROM Cohorts
`

function getAllCohorts () {
    return db.raw(getAllCohortsQuery)
}

function getOneCohort (slug) {
    return db.raw("SELECT * FROM Cohorts WHERE slug = ?", [slug])
}

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
