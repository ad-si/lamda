import path from 'path'

import utils from '../modules/utils.js'


export default function (request, response, next) {
  const photosDir = path.join(request.app.locals.basePath, 'photos')

  return utils
    .getFiles(photosDir)
    .then(utils.filterYears)
    .then(years => Promise.all(
      years.map(year =>
        utils.getMonthsForYear(year, photosDir, request.app.locals.baseURL)),
    ))
    .then(years => {
      response.render('index', {
        page: 'Photos',
        years: years || [],
      })
    })
    .catch(next)
}
