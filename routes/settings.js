'use strict'

const fs = require('fs')
const yaml = require('js-yaml')


module.exports = function (request, response) {

	var availableSettings = {
			theme: ['light', 'dark'],
			baseURL: '',
			owner: {}
		}

	response.render('settings', {
		page: 'settings',
		settings: global.config,
		availableSettings: availableSettings
	})
}
