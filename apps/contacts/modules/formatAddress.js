import getCountryCode from './getCountryCode.js'

export default function (addr) {
  const countryEntry = addr
    ? getCountryCode(addr.country)
    : null

  if (addr.country) {
    if (addr.country.length === 2) {
      addr.countryCode = addr.country
    }
    else {
      addr.countryCode = countryEntry
        ? countryEntry.cca2.toLowerCase()
        : ''
    }
  }

  return addr
}
