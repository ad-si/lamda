'use strict'

const countries = require('world-countries')

module.exports = (countryName) => {

  if (typeof countryName !== 'string') {
    return
  }

  let soughtElement = null

  countries.some(element => {
    if (element.name &&
      element.name.common &&
      element.name.common.toLowerCase() === countryName.toLowerCase()
    ) {
      soughtElement = element || ''
      return true
    }

    return false
  })

  return soughtElement
}
