const fs = require('fs')
const mustache = require('mustache')

const express = require('express')
var app = express()

const log = require('./src/logging.js')
const {createCohort, getAllCohorts, getOneCohort} = require('./src/db/cohorts.js')

// set the port to listen on 
const port = 3000

// ---------------------------------------------------------
// Express.js Endpoints

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


function slugify (str) {
    return str.toLowerCase().replace(/\s+/g, '-')
}

// post request
app.post('/cohorts', function(req, res) {
    const cohortTitle = req.body.title
    let slug = req.body.slug

    if (slug === '') {
        slug = slugify(cohortTitle)
    }

    const newCohort = {
        title: cohortTitle,
        slug: slug,
        startDate: req.body.startDate,
        endDate: req.body.endDate
    }

    createCohort(newCohort)
        .then(function() {
            res.send(mustache.render(successTemplate, {
                newCohortName: cohortTitle, 
                newCohortSlug: slug
            }))
            log.info('created a cohort')
        })
        .catch(function () {
            res.status(500).send('something went wrong')
        })
})

// listens for requests for a particular cohort slug,
// then renders the data as a JSON string
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
    })
    .catch(function(err){
        log.error('uh-oh did not find cohort')
        log.error(err)
        res.status(404).send('cohort not found :(')
    })
})

// this activates listening on the defined port
app.listen(port, function () { 
    log.info('listening on port ' + port + ' 🤖')
})

// ---------------------------------------------------------
// HTML rendering

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


