import fs from 'fs'
import nib from 'nib'
import stylus from 'stylus'


const countries = JSON.parse(
  fs.readFileSync('./public/js/countries.json', 'utf-8'),
)
const utils = {}


function getFromArray (array, key, value) {
  let soughtElement = null

  array.some(element => {
    const isEqual = element[key] === value
    if (isEqual) soughtElement = element || ''
    return isEqual
  })

  return soughtElement
}


function capitalize (string) {
  if (typeof string === 'string') {
    return string
      .charAt(0)
      .toUpperCase() +
      string
        .substring(1)
        .toLowerCase()
  }
  else {
    return string
  }
}


utils.getFromArray = getFromArray
utils.capitalize = capitalize

utils.compileStyl = (str, path, config) => {
  return stylus(str)
    .set('filename', path)
    .set('compress', false) // TODO: Compress in production
    .define('theme', config.theme)
    .define('rotation', config.rotation)
    .use(nib())
    .import('nib')
}

utils.writeKeys = (keysObject, data) => {
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      continue
    }
    keysObject[key] = true
  }
}

utils.formatData = data => {
  data.gender = data.gender || ''

  function formatAddress (addr) {
    const countryEntry = getFromArray(
      countries,
      'name',
      capitalize(addr.country),
    )

    if (addr.country) {
      if (addr.country.length === 2) {
        addr.countryCode = addr.country
      }
      else {
        addr.countryCode = countryEntry
          ? countryEntry
            .cca2
            .toLowerCase()
          : ''
      }
    }

    return addr
  }

  if (data.address) {
    data.address = formatAddress(data.address)
  }

  return data
}

utils.isLilypondFile = (fileName) => {
  return fileName.search(/.+\.(ly)$/gi) !== -1
}

utils.isBook = (fileName) => {
  return fileName.search(/.+\.(epub)$/gi) !== -1
}

utils.isImage = (fileName) => {
  return fileName.search(/.+\.(jpg|png)$/gi) !== -1
}

utils.isSong = (fileName) => {
  return fileName.search(/.+\.(mp3|wav|ogg|m4a)$/gi) !== -1
}

utils.removeFileExtension = (string) => {
  return string.replace(/\.[^/.]+$/, '')
}


export default utils
