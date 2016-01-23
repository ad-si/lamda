countries = require('world-countries')
capitalize = require('capitalize')


function getCountryCode (countryName) {

	var soughtElement = null

	countries.some(function (element) {
		if (element.name.common.toLowerCase() === countryName.toLowerCase()) {
			soughtElement = element || ''
			return true
		}
	})

	return soughtElement
}


module.exports = function (data) {

	data.gender = data.gender || ''

	if (data.birthday)
		data.age = String(
			new Date(new Date() - data.birthday)
				.toISOString()
				.substr(0,4) - 1970
		)


	function formatAddress (addr) {

		var countryEntry = getCountryCode(addr.country)

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
