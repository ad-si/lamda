var fs = require('fs'),

	yaml = require('js-yaml')


module.exports = function(request, response){

	var fileContent = fs.readFileSync(global.baseURL + '/config.yaml', 'utf-8'),
		settings = yaml.safeLoad(fileContent)

	response.render('settings', {
		page: 'settings',
		settings: settings
	})

}
