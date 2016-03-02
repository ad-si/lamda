module.exports = (array) => {
	const fieldsMap = {}

	array.forEach(array => {
		Object
			.keys(array)
			.forEach(key => fieldsMap[key] = true)
	})

	return Object.keys(fieldsMap)
}
