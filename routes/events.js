'use strict'

let fsp = require('fs-promise')
let path = require('path')
let moment = require('moment')
let clone = require('clone')
let userHome = require('user-home')

let loadEvents = require('../modules/loadEvents')
let processEvents = require('../modules/processEvents')
let mapEventsToDays = require('../modules/mapEventsToDays')


module.exports = function (request, response, done) {

	let now = moment()
	let pastDays = 10
	let futureDays = 50
	let eventPromises = loadEvents(path.join(userHome, 'Events'))
	let startDate = now
		.clone()
		.subtract(pastDays, 'days')
	let endDate = startDate
		.clone()
		.add(pastDays + futureDays, 'days')

	eventPromises
		.then(events => {
			let processedEvents = processEvents(
				events,
				startDate,
				endDate
			)

			let renderDays = mapEventsToDays(
				processedEvents,
				startDate,
				endDate
			)

			response.render('index', {
				page: 'events',
				days: renderDays
			})
		})
		.catch(error => {
			done(error)
		})
}
