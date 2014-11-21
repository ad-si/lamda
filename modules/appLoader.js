var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml')


module.exports = function (rootApp, locals) {

	var appNames = fs.readdirSync('./apps'),
		apps = {}

	appNames = appNames.filter(function (name) {

		var appPath = path.join('apps', name)

		return fs.lstatSync(appPath).isDirectory() && name !== 'boilerplate'
	})


	appNames.forEach(function (appName) {

		var appPath = path.join(global.projectURL, 'apps', appName),
			appModule,
			packageContent

		try {
			appModule = require(appPath)
		}
		catch (error) {
			console.error(
				'The error', error,
				'occured While loading the app:', appName
			)
			return
		}

		if (fs.existsSync(appPath + '/package.yaml')) {
			packageContent = yaml.safeLoad(
				fs.readFileSync(path.join(appPath, 'package.yaml'), 'utf-8')
			)
		}
		else if (fs.existsSync(path.join(appPath, 'package.json'))) {
			packageContent = JSON.parse(
				fs.readFileSync(path.join(appPath, 'package.json'), 'utf-8')
			)
		}
		else
			throw new Error('Package file is missing!')


		apps[appName] = packageContent

		if (!apps[appName].hasOwnProperty('lamda'))
			apps[appName].lamda = {}


		apps[appName].lamda.module = appModule
		apps[appName].lamda.path = appPath


		appModule.locals = locals
		appModule.locals.page = appName

		rootApp.use('/' + appName, appModule)
	})

	return apps
}
