// --------------------------------------------------------
// Express, Mustache, dotenv configuration
require('dotenv').config()
const fs = require('fs')
const mustache = require('mustache')

const express = require('express')
var app = express()

const log = require('./src/logging.js')
const {createCohort, getAllCohorts, getOneCohort} = require('./src/db/cohorts.js')

// this serves the defined folder and files within to a browser
app.use(express.static('public'))

// set the port to listen on 
const port = process.env.PORT

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

// function to create a slug from the cohort name
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

// ---------------------------------------------------------
// Passport Configuration

const passport = require('passport')
app.use(passport.initialize())
app.use(passport.session())

// TODO: ADD TEMPLATES HERE
app.get('/success', (req, res) => res.send("You have successfully logged in"))
app.get('/error', (req, res) => res.send("Error logging in"))

// this is invoked on authorization and serializes the user instance 
// and stores it in the session via cookie
passport.serializeUser(function(user, cb) {
    cb(null, user)
})

// invoked every subsequent request to deserialize the instance, 
// providing it the unique cookie identifier as a credential
passport.deserializeUser(function(obj, cb) {
    cb(null, obj)
})

// ---------------------------------------------------------
// Facebook Auth Configuration

const FacebookStrategy = require('passport-facebook').Strategy

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET


passport.use(new FacebookStrategy ({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback'
    },
    function(accessToken, refreshToken, profile, cb) {
        return cb(null, profile)
    }
))

app.get('/auth/facebook',
    passport.authenticate('facebook')
)

app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', {
        failureRedirect: '/error'
    }), 
    function(req, res) {
        res.redirect('/success')
    }
)