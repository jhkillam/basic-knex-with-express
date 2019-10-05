const fs = require('fs')
const mustache = require('mustache')

const express = require('express')
var app = express()

// this links to the knexfile to select different db configurations
const dbConfigs = require('./knexfile.js')

// selection development config from the knexfile
const db = require('knex')(dbConfigs.development)

// set the port to listen on 
const port = 3000

// loads the template pages into variables as a string
const homepageTemplate = fs.readFileSync('./templates/homepage.html', 'utf8')
const successTemplate = fs.readFileSync('./templates/success.html', 'utf-8')
const cohortPageTemplate = fs.readFileSync('./templates/cohort.html', 'utf-8')

app.use(express.urlencoded())

// listen for incoming requests on the '/' page
app.get('/', function (req, res) {
    // runs function to get all the cohorts from the database, 
    // then sends them to the browser for rendering
    getAllCohorts()
    .then(function(allCohorts) {
        res.send(mustache.render(homepageTemplate, {cohortsListHTML: renderAllCohorts(allCohorts)}))
    })
})

// post request
app.post('/cohorts', function(req, res) {
    // console.log('here is what you sent in post request')
    // console.log(req.params)
    // console.log(req.body)
    // res.send('you tried to make a post request')

    // TODO: Make a success page template 
    // ~~~~~~~~~~~~~~~~~~~~~~~DONE
    createCohort(req.body)
        .then(function() {
            // res.send('hopefully created a cohort <a href="/">go home</a>')
            res.send(mustache.render(successTemplate, {
                newCohortName: req.body.title, 
                newCohortSlug: req.body.slug
            }))
            console.log('created a cohort')
        })
        .catch(function () {
            res.status(500).send('something went wrong')
        })
})

// listens for requests for a particular cohort slug,
// then renders the data as a JSON string
// TODO: Make a cohorts page template 
// ~~~~~~~~~~~~~~~~~~~~~~~~~~DONE
app.get('/cohorts/:slug', function (req, res) {
    
    getOneCohort(req.params.slug)
    .then(function(cohort) {
        console.log('here is the requested cohort:')
        console.log(cohort)

        // check if cohort is currently active
        let isCohortActive = ""
        if (cohort.isActive === 1) {
            isCohortActive = "is currently active"
        } else {
            isCohortActive = "is not active"
        }
        res.send(mustache.render(cohortPageTemplate, {
            cohortTitle: cohort.title, 
            cohortStatus: isCohortActive,
            cohortStartDate: cohort.startDate,
            cohortEndDate: cohort.endDate
        }))
        // res.send('<pre>' + JSON.stringify(cohort) + '</pre>')
    })
    .catch(function(err){
        console.log('uh-oh did not find cohort')
        console.log(err)
        res.status(404).send('cohort not found :(')
    })
})

// this activates listening on the defined port
app.listen(port, function () { 
    console.log('listening on port ' + port)
})

// this is storing a basic SQL query in a variable to be used elsewhere
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
        .then(function(results) {
            if (results.length !== 1) {
                throw null
            } else {
                return results[0]
            }
        })
}

// takes the cohort slug and renders it into a link
function renderCohort (cohort) {
    return `
    <li><a href="/cohorts/${cohort.slug}">${cohort.title}</a></li>
    `
}

// renders all the cohorts into HTML list
function renderAllCohorts (allCohorts) {
    return '<ul>' + allCohorts.map(renderCohort).join('') + '</ul>'
}

// SQL query to insert new cohort from a form submission
// this currently defaults to TRUE for isActive
function createCohort (cohort) {
    return db.raw('INSERT INTO Cohorts (title, slug, isActive, startDate, endDate) VALUES (?, ?, true, ?, ?)', [cohort.title, cohort.slug, cohort.startDate, cohort.endDate])
}
