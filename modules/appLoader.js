'use strict'

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const packageData = require('../package.json')


function getPackageContent (appPath) {
	if (fs.existsSync(path.join(appPath, 'package.yaml'))) {
		return yaml.safeLoad(
			fs.readFileSync(
				path.join(appPath, 'package.yaml'),
				'utf-8'
			)
		)
	}
	else if (fs.existsSync(path.join(appPath, 'package.json'))) {
		return require(path.join(appPath, 'package.json'))
	}
	else
		throw new Error('Package file is missing!')
}


function addAppToAppMap (appMap, appPath, rootApp, locals) {

	var appPath = path.join(global.projectPath, appPath),
		appName = path.basename(appPath),
		appModule

	try {
		appModule = require(appPath)

		appMap[appName] = getPackageContent(appPath)

		if (!appMap[appName].hasOwnProperty('lamda'))
			appMap[appName].lamda = {}

		appMap[appName].lamda.module = appModule
		appMap[appName].lamda.path = appPath

		appModule.locals = locals
		appModule.locals.page = appName

		rootApp.use('/' + appName, appModule)
	}
	catch (error) {
		console.error('Following error occured while loading the app:', appName)
		console.error(error.stack)
	}

	return appMap
}


module.exports = function (rootApp, locals) {

	var appDirectories,
		appNames

	if (!fs.existsSync('apps'))
		appDirectories = Object.keys(packageData.optionalDependencies)
			.map(function (name) {
				return path.join('node_modules', name)
			})
	else
		appDirectories = fs
			.readdirSync('./apps')
			.map(function () {
				return path.join('apps', name)
			})

	return appDirectories
		.filter(function (appPath) {
			return fs.statSync(appPath).isDirectory() &&
				path.basename(appPath) !== 'boilerplate'
		})
		.reduce(
			(map, appPath) => addAppToAppMap(map, appPath, rootApp, locals),
			{}
		)
}
