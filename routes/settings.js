'use strict'

const fs = require('fs')
const yaml = require('js-yaml')


module.exports = function (request, response) {

	var availableSettings = {
			theme: ['light', 'dark'],
			owner: {}
		}

	response.render('settings', {
		page: 'settings',
		settings: request.app.locals.config,
		availableSettings: availableSettings
	})
}
