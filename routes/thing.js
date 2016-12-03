const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const isImage = require('is-image')

module.exports = (options = {}) => {
  const {basePath} = options
  
  return (request, response) => {
    const requestedThingPath = path.join(basePath, request.params.id)
    const files = fs.readdirSync(requestedThingPath)
    const images = files.filter(isImage)

    function renderPage () {
      if (files.indexOf('index.yaml') === -1) {
        response.render('thing', {
          page: 'thing',
          thing: {
            id: request.params.id,
            name: request
              .params
              .id
              .replace(/_/g, ' ')
              .replace(/-/g, ' - '),
            images: images,
          },
        })
      }
      else {
        fs.readFile(
          path.join(requestedThingPath, 'index.yaml'),
          {encoding: 'utf-8'},
          (error, fileContent) => {
            if (error) throw error

            const jsonData = yaml.safeLoad(fileContent)
            jsonData.id = request.params.id
            jsonData.images = images

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
