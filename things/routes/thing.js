const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const isImage = require('is-image')

const {getMainYamlFile} = require('./helpers.js')


module.exports = (options = {}) => {
  const {basePath} = options

  return (request, response) => {
    const requestedThingPath = path.join(basePath, request.params.id)
    const files = fs.readdirSync(requestedThingPath)
    const images = files.filter(isImage)
    console.log(files)
    const pdfs = files.filter(file => file.toLowerCase().endsWith('.pdf'))

    function renderPage () {
      const dataFileName = getMainYamlFile(files)

      if (!dataFileName) {
        response.render('thing', {
          page: 'thing',
          thing: {
            id: request.params.id,
            name: request
              .params
              .id
              .replace(/_/g, ' ')
              .replace(/-/g, ' - '),
            images,
            pdfs,
          },
        })
      }
      else {
        fs.readFile(
          path.join(requestedThingPath, dataFileName),
          {encoding: 'utf-8'},
          (error, fileContent) => {
            if (error) throw error

            const jsonData = yaml.safeLoad(fileContent)
            jsonData.id = request.params.id
            jsonData.images = images
            jsonData.pdfs = pdfs

            response.render('thing', {
              page: 'thing',
              thing: jsonData,
            })
          }
        )
      }
    }

    // if (!createThumbnails(req.params.name, images))
    //  imagesPath = '/thumbs/sheetmusic'

    renderPage()
  }
}
