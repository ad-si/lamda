module.exports.writeAvailableKeys = function (keysObject, data) {

	for (var key in data)
		if (data.hasOwnProperty(key))
			keysObject[key] = true
}

module.exports.formatAddress = function(data) {

	var addr = data.address,
		addrArray = []


	if(addr.country) addrArray.push(addr.country)

	if(addr.zip && addr.city)
		addrArray.push(addr.zip + ' ' + addr.city)
	else {
		if(addr.zip) addrArray.push(addr.zip)
		if(addr.city) addrArray.push(addr.city)
	}

	if(addr.street) addrArray.push(addr.street)
	if(addr.addition) addrArray.push(addr.addition)

	data.address = addrArray.join(', ')

	return data
}
