const path = require('path')
const url = require('url')
const util = require('util')

const gm = require('gm')


module.exports = (request, response) => {
  const year = request.params.year
  const month = request.params.month
  const day = request.params.day
  const eventName = request.params.event
  const photoName = request.params.photo

  const urlObject = url.parse(request.url, true)
  const src = [
    request.app.locals.basePath,
    year,
    month,
    util.format('%s-%s-%s_%s', year, month, day, eventName),
    photoName,
  ].join('/') +
  '.' + urlObject.query.filetype

  gm(path.join(global.baseURL, src))
    .identify((error, data) => {
      if (error) {
        console.error(error)
      }

      response.render('photo', {
        page: 'Photo',
        photo: {
          name: request.params.photo,
          src: src,
          exif: JSON.stringify(data, null, 2),
        },
      })
    })
}
