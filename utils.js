var countries = require('./public/js/countries.json'),
	nib = require('nib'),
	stylus = require('stylus'),
	utils = {}


function getFromArray (array, key, value) {

	var soughtElement = null

	array.some(function (element) {
		if (element[key] === value) {
			soughtElement = element || ''
			return true
		}
	})

	return soughtElement
}

function capitalize (string) {
	if (typeof string === 'string')
		return string.charAt(0).toUpperCase() +
			string.substring(1).toLowerCase()
	else
		return string
}


utils.getFromArray = getFromArray

utils.capitalize = capitalize

utils.compileStyl = function (str, path, config) {

	return stylus(str)
		.set('filename', path)
		.set('compress', !global.devMode)
		.define('theme', config.theme)
		.define('rotation', config.rotation)
		.use(nib())
		.import('nib')
}

utils.writeKeys = function (keysObject, data) {

	for (var key in data)
		if (data.hasOwnProperty(key))
			keysObject[key] = true
}

utils.formatData = function (data) {

	data.gender = data.gender || ''


	function formatAddress (addr) {

		var countryEntry = getFromArray(
			countries,
			'name',
			capitalize(addr.country)
		)

		if (addr.country) {

			if (addr.country.length === 2)
				addr.countryCode = addr.country
			else
				addr.countryCode = countryEntry ? countryEntry
					.cca2
					.toLowerCase() : ''
		}

		return addr
	}

	if (data.address)
		data.address = formatAddress(data.address)

	return data
}

utils.isLilypondFile = function (fileName) {
	return fileName.search(/.+\.(ly)$/gi) !== -1
}

utils.isBook = function (fileName) {
	return fileName.search(/.+\.(epub)$/gi) !== -1
}

utils.isImage = function (fileName) {
	return fileName.search(/.+\.(jpg|png)$/gi) !== -1
}

utils.isSong = function (fileName) {
	return fileName.search(/.+\.(mp3|wav|ogg|m4a)$/gi) !== -1
}

utils.removeFileExtension = function (string) {
	return string.replace(/\.[^/.]+$/, '')
}


module.exports = utils
