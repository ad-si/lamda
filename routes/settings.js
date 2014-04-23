var fs = require('fs'),

	yaml = require('js-yaml')


module.exports = function (request, response) {

	var availableSettings = {
			theme: ['light', 'dark'],
			baseURL: '',
			owner: {}
		}

	console.log(global.config)

	response.render('settings', {
		page: 'settings',
		settings: global.config,
		availableSettings: availableSettings
	})

}
