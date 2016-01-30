countries = require('world-countries')
capitalize = require('capitalize')


function getCountryCode (countryName) {

	if (typeof countryName !== 'string') {
		return
	}

	var soughtElement = null

	countries.some(element => {
		if (element.name &&
			element.name.common &&
			element.name.common.toLowerCase() === countryName.toLowerCase()) {
			soughtElement = element || ''
			return true
		}
	})

	return soughtElement
}


module.exports = function (data) {

	data.gender = data.gender || ''

	if (data.email && typeof data.email !== 'string')
		data.email = data.email.value

	if (!data.name)
		data.name = data.firstname + ' ' + data.lastname

	if (typeof data.phone === 'number')
		data.phone = '+' + data.phone
	if (typeof data.mobile === 'number')
		data.mobile = '+' + data.mobile
	if (typeof data.fax === 'number')
		data.fax = '+' + data.fax

	if (data.birthday) {
		data.birthday = new Date(data.birthday)
		data.age = String(
			new Date(new Date() - data.birthday)
				.toISOString()
				.substr(0,4) - 1970
		)
	}


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
