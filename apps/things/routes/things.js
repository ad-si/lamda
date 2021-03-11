const fs = require('fs')
const path = require('path')
const url = require('url')

const fsp = require('fs-promise')
const yaml = require('js-yaml')
const isImage = require('is-image')
const Instant = require('@datatypes/moment').Instant

const {getMainYamlFile} = require('./helpers.js')
const thumbnailsDirectory = path.resolve(__dirname, '../public/thumbnails')


try {
  fs.mkdirSync(thumbnailsDirectory)
}
catch (error) {
  if (error && error.code !== 'EEXIST') {
    throw error
  }
}


function getCoverImage (images) {
  // Try to load one of the default images,
  // otherwise choose a random one

  images = images || []
  // With descending importance
  const defaultNames = [
    'main',
    'overview',
    'top',
    'front',
    'side',
  ]
  let coverImage = images[0] || null

  defaultNames.some(name => {
    return images.some(image => {
      const pngName = path.basename(image, '.png')
      if (pngName === name) {
        coverImage = image
        return true
      }

      const heicName = path.basename(image, '.heic')
      if (heicName === name) {
        coverImage = image
        return true
      }

      return false
    })
  })

  return coverImage
}


function callRenderer (response, things, view) {
  let fortune

  if (things) {
    fortune = things
      .map(element => {
        return element.price
      })
      .reduce((previous, current) => {
        if (typeof previous === 'string') {
          previous = Number(previous.slice(0, -1))
        }

        previous = previous || 0

        if (typeof current === 'string') {
          current = Number(
            current
              .slice(0, -1)
              .replace('~', ''),
          )
        }

        current = current || 0

        return previous + current
      })
      .toFixed(2)
  }

  things = things || []

  response.render('things', {
    page: 'things',
    things: things.sort((itemA, itemB) => {
      let datetimeA = itemA.dateOfPurchase && itemA.dateOfPurchase !== 'Date'
        ? itemA.dateOfPurchase
        : itemA.datetime
      let datetimeB = itemB.dateOfPurchase && itemB.dateOfPurchase !== 'Date'
        ? itemB.dateOfPurchase
        : itemB.datetime

      datetimeA = new Instant(datetimeA)
        .getTime()
        ? new Instant(datetimeA)
        : new Instant(0)
      datetimeB = new Instant(datetimeB)
        .getTime()
        ? new Instant(datetimeB)
        : new Instant(0)

      return Number(datetimeB) - Number(datetimeA)
    }),
    view: view,
    fortune: fortune,
  })
}


module.exports = (options = {}) => {
  const {baseURL, basePath} = options
  const thingsDir = basePath

  return (request, response) => {
    const view = request.query.view === 'wide'
      ? 'wide'
      : 'standard'

    return fsp
      .readdir(thingsDir)
      .then(thingDirs => thingDirs
        .filter(thingDir => !thingDir.includes('.'))
        .map(thingDir => {
          const thing = {
            datetime: thingDir.split('_')[0],
            images: [],
            directory: thingDir,
            absoluteDirectory: path.join(thingsDir, thingDir),
          }

          return fsp
            .readdir(thing.absoluteDirectory)
            .catch(error => console.error(error))
            .then(files => {
              thing.files = files
              return thing
            })
        }),
      )
      .then(thingPromises => {
        return Promise.all(thingPromises)
      })
      .then(things => {
        return things.map(thing => {
          thing.images = thing.files.filter(isImage)
          const dataFileName = getMainYamlFile(thing.files)

          if (dataFileName) {
            const filePath = path.join(thingsDir, thing.directory, dataFileName)
            return fsp
              .readFile(filePath)
              .then(fileContent => {
                const thingData = yaml.load(fileContent)
                return Object.assign(thing, thingData)
              })
              .catch(error => {
                console.error(filePath)
                console.error(error)
                return thing
              })
          }
          else {
            return Promise.resolve(thing)
          }
        })
      })
      .then(thingPromises => {
        return Promise.all(thingPromises)
      })
      .then(things => {
        return things.map(thing => {
          const coverImage = getCoverImage(thing.images)

          if (coverImage)  {
            thing.imagePath = path.join(thing.directory, coverImage)
            thing.imageThumbnailPath = path.join(
              thumbnailsDirectory, thing.imagePath)
            thing.image = url.format({
              pathname: `${baseURL}/${thing.imagePath}`,
              query: {
                'max-width': 200,
                'max-height': 200,
              },
            })
            thing.rawImage = `${baseURL}/${thing.imagePath}`
          }

          thing.name = thing.directory.replace(/_/g, ' ')
          thing.url = `${baseURL}/${thing.directory}`

          return thing
        })
      })
      .then(things => {
        const filteredThings = things
          .filter(thing => !Object.prototype
            .hasOwnProperty.call(thing, 'endOfLife'))
        callRenderer(response, filteredThings, view)
      })
      .catch(error => {
        console.error(error.stack)
      })
  }
}
