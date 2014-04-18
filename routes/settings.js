var fs = require('fs'),

	yaml = require('js-yaml')


module.exports = function (request, response) {

	var fileContent = fs.readFileSync(global.baseURL + '/config.yaml', 'utf-8'),
		settings = yaml.safeLoad(fileContent),
		availableSettings = {
			theme: ['light', 'dark'],
			baseURL: '',
			owner: {}
		}

	response.render('settings', {
		page: 'settings',
		settings: settings,
		availableSettings: availableSettings
	})

}
