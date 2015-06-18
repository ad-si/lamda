countries = require('world-countries')
capitalize = require('capitalize')


function getFromArray (array, key, value) {

	var soughtElement = null

	array.some(function (element) {
		if (element[key] == value) {
			soughtElement = element || ''
			return true
		}
	})

	return soughtElement
}


module.exports = function (data) {

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
