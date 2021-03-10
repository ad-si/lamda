const path = require('path')
const util = require('util')

const utils = require('../modules/utils')

const events = {}


events.period = function (request, response, next) {
  const photosDirectory = path.join(request.app.locals.basePath, 'photos')
  const year = request.params.year
  const month = request.params.month
  const day = request.params.day

  if (day) {
    // TODO
  }
  else if (month) {
    utils
      .getEventsForMonth(
        year,
        month,
        photosDirectory,
        request.app.locals.baseURL
      )
      .then(monthObject => {
        monthObject.page = 'Photos'
        monthObject.year = year
        monthObject.yearUrl = request.app.locals.baseURL + '/' + year

        response.render('index', monthObject)
      })
      .catch(error => {
        console.error(error)
        next()
      })
  }
  else {
    utils
      .getMonthsForYear(year, photosDirectory, request.app.locals.baseURL)
      .then(yearObject => {

        response.render('index', {
          page: 'Photos',
          years: [yearObject],
        })
      })
      .catch(error => {
        console.error(error)
        next()
      })
  }
}


events.event = (request, response) => {
  const photosDirectory = path.join(request.app.locals.basePath, 'photos')
  const year = request.params.year
  const month = request.params.month
  const day = request.params.day
  const eventName = request.params.event

  utils
    .getImagesForEvent(year, month, day, eventName, photosDirectory)
    .then(utils.filterImages)
    .then(photos => {
      return photos.map(photoName => {
        return {
          name: photoName,
          url: [
            request.app.locals.baseURL,
            year,
            month,
            day,
            eventName,
            photoName.replace(/\.(jpg|png)$/i, '') +
            '?filetype=' +
            path
              .extname(photoName)
              .slice(1)
              .toLowerCase(),
          ].join('/'),
          src: [
            request.app.locals.baseURL,
            year,
            month,
            util.format('%s-%s-%s_%s', year, month, day, eventName),
            photoName,
          ].join('/'),
        }
      })
    })
    .then(photos => {
      response.render('event', {
        page: 'Event',
        maxWidth: 300,
        maxHeight: 300,
        event: {
          year: year,
          month: month,
          day: day,
          name: eventName,
          photos: photos,
        },
      })
    })
}

module.exports = events
