var countries = require('./public/js/countries.json'),
    nib = require('nib'),
    stylus = require('stylus'),
    util = {}


function getFromArray (array, key, value) {

	var soughtElement = null

	array.some(function (element) {
		if (element[key] == value) {
			soughtElement = element
			return true
		}
	})

	return soughtElement
}

function capitalize (string) {
	return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()
}


util.getFromArray = getFromArray

util.capitalize = capitalize

util.compileStyl = function (str, path, theme) {

	return stylus(str)
		.set('filename', path)
		.set('compress', !global.devMode)
		.use(nib())
		.import('nib')
		.import(global.projectURL + '/public/styles/shared')
		.import(global.projectURL + '/public/styles/themes/' + theme)
}

util.writeKeys = function (keysObject, data) {

	for (var key in data)
		if (data.hasOwnProperty(key))
			keysObject[key] = true
}

util.formatData = function (data) {

	data.gender = data.gender || ''


	function formatAddress (addr) {

		if (addr.country) {

			if (addr.country.length === 2)
				addr.countryCode = addr.country
			else
				addr.countryCode =
				getFromArray(countries, 'name', capitalize(addr.country))
					.cca2
					.toLowerCase()
		}

		return addr
	}

	if (data.address)
		data.address = formatAddress(data.address)

	return data
}

util.isLilypondFile = function (fileName){
	return fileName.search(/.+\.(ly)$/gi) !== -1
}

util.isBook = function (fileName) {
	return fileName.search(/.+\.(epub)$/gi) !== -1
}

util.isImage = function (fileName) {
	return fileName.search(/.+\.(jpg|png)$/gi) !== -1
}

util.isSong = function (fileName) {
	return fileName.search(/.+\.(mp3|wav|ogg|m4a)$/gi) !== -1
}

util.removeFileExtension = function (string) {
	return string.replace(/\.[^/.]+$/, '')
}


module.exports = util
