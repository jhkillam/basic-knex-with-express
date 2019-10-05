const {db} = require('../database.js')

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

// SQL query to insert new cohort from a form submission
// this currently defaults to TRUE for isActive
function createCohort (cohort) {
    return db.raw('INSERT INTO Cohorts (title, slug, isActive, startDate, endDate) VALUES (?, ?, true, ?, ?)', [cohort.title, cohort.slug, cohort.startDate, cohort.endDate])
}

// ---------------------------------
// Public API

module.exports = {
    createCohort: createCohort,
    getAllCohorts: getAllCohorts,
    getOneCohort: getOneCohort
}