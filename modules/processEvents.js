'use strict'

let moment = require('moment')
let addEndDate = require('./addEndDate')
let addEmptyEvents = require('./addEmptyEvents')
let splitEvents = require('./splitEvents')
let addStyleInformation = require('./addStyleInformation')


module.exports = function (events, startDate, endDate) {

	events = addEmptyEvents(events)
	events = addStyleInformation(events)
	// events = splitEvents(events, startDate, endDate)

	return events
}
