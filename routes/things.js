const fs = require('fs')
const path = require('path')
const url = require('url')

const fsp = require('fs-promise')
const yaml = require('js-yaml')
const isImage = require('is-image')

// const imageResizer = require('image-resizer-middleware')

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
  const defaultNames = [
    'overview',
    'front',
    'index',
    'top',
  ]
  let coverImage = images[0] || null

  defaultNames.some(name => {
    return images.some(image => {
      const baseName = path.basename(image, '.png')

      if (baseName === name) {
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
              .replace('~', '')
          )
        }

        current = current || 0

        return previous + current
      })
      .toFixed(2)
  }

  things = things || []

  response.render('index', {
    page: 'things',
    things: things.sort((itemA, itemB) => {

      const dateA = itemA.dateOfPurchase === 'Date' ? 0 : itemA.dateOfPurchase
      const dateB = itemB.dateOfPurchase === 'Date' ? 0 : itemB.dateOfPurchase

      itemA = new Date(dateA || 0)
      itemB = new Date(dateB || 0)

      return itemB - itemA
    }),
    view: view,
    fortune: fortune,
  })
}


module.exports = (options = {}) => {
  const {baseURL, appPath: thingsDir} = options

  return (request, response) => {
    const view = request.query.view === 'wide'
      ? 'wide'
      : 'standard'

    return fsp
      .readdir(thingsDir)
      .then(thingDirs => thingDirs
        .filter(thingDir => !thingDir.startsWith('.'))
        .map(thingDir => {
          const thing = {
            images: [],
            directory: thingDir,
          }
          const absoluteThingDir = path.join(thingsDir, thingDir)

          return fsp
            .readdir(absoluteThingDir)
            .then(files => {
              thing.files = files
              return thing
            })
        })
      )
      .then(thingPromises => {
        return Promise.all(thingPromises)
      })
      .then(things => {
        return things.map(thing => {
          thing.images = thing.files.filter(isImage)

          if (thing.files.indexOf('index.yaml') > 0) {
            return fsp
              .readFile(
                path.join(thingsDir, thing.directory, 'index.yaml')
              )
              .then(fileContent => {
                const thingData = yaml.safeLoad(fileContent)
                return Object.assign(thing, thingData)
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
        callRenderer(response, things, view)
      })
      .catch(error => {
        console.error(error.stack)
      })
  }
}
