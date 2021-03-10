module.exports = (array) => {
  const fieldsMap = {}

  array.forEach(subArray => {
    Object
      .keys(subArray)
      .forEach(key => fieldsMap[key] = true)
  })

  return Object.keys(fieldsMap)
}
