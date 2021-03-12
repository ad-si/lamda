import countries from 'world-countries'

export default function (countryName) {

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
