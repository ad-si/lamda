'use strict'

const moment = require('moment')
const addEndDate = require('./addEndDate')
const addEmptyEvents = require('./addEmptyEvents')
const splitEvents = require('./splitEvents')
const addStyleInformation = require('./addStyleInformation')


module.exports = function (events, startDate, endDate) {

	events = addEmptyEvents(events)
	events = addStyleInformation(events)
	// events = splitEvents(events, startDate, endDate)

	return events
}
