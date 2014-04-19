module.exports.writeKeys = function (keysObject, data) {

	for (var key in data)
		if (data.hasOwnProperty(key))
			keysObject[key] = true
}

module.exports.formatData = function (data) {

	data.gender = data.gender || ''


	function formatAddress(addr){

		var addrArray = []


		if (addr.country) addrArray.push(addr.country)

		if (addr.zip && addr.city)
			addrArray.push(addr.zip + ' ' + addr.city)
		else {
			if (addr.zip) addrArray.push(addr.zip)
			if (addr.city) addrArray.push(addr.city)
		}

		if (addr.street) addrArray.push(addr.street)
		if (addr.addition) addrArray.push(addr.addition)

		return addrArray.join(', ')
	}


	if (data.address)
		data.address = formatAddress(data.address)


	return data
}
