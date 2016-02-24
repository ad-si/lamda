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

function addPlus (number) {
	return String(
		String(number)[0] !== '+' ?
		'+' + number :
		number
	)
}

function addPhone (number, array) {
	if (typeof number === 'number' || typeof number === 'string') {
		array.push({
			type: 'mobile',
			number: number
		})
	}
}


function combinePhoneNumbers (contact) {
	contact.phones = contact.phones || []

	addPhone(contact.mobile, contact.phones)
	delete contact.mobile

	addPhone(contact.phone, contact.phones)
	delete contact.phone

	addPhone(contact.home, contact.phones)
	delete contact.home

	contact.phones.forEach(phone => {
		phone.number = addPlus(phone.number)
	})

	return contact
}

function unifyEmailAddresses (contact) {
	contact.emails = contact.emails || []

	if (contact.email) {
		if (typeof contact.email === 'string') {
			contact.emails.push({
				type: 'main',
				value: contact.email
			})
		}
		else {
			contact.emails.push(contact.email)
		}
		delete contact.email
	}

	contact.emails = contact.emails.map(email => {
		if (typeof email === 'string') {
			return {
				value: email
			}
		}
		return email
	})

	return contact
}

module.exports = (data) => {

	data.gender = data.gender || ''

	if (data.email && typeof data.email !== 'string')
		data.email = data.email.value

	if (!data.name)
		data.name = data.firstname + ' ' + data.lastname

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

	data = combinePhoneNumbers(data)
	data = unifyEmailAddresses(data)

	return data
}
