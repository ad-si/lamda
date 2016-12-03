const fs = require('fs')
const path = require('path')
const util = require('util')

const filterMonths = filterTwoDigitDirs
const filterDays = filterTwoDigitDirs

// function getYear (date) {
//   try {
//     date = date.toISOString()
//   }
//   catch (error) {
//     console.error(error.stack)
//   }
//   return date.slice(0, 4)
// }

function getMonth (date) {
  try {
    date = date.toISOString()
  }
  catch (error) {
    console.error(error.stack)
  }
  return date.slice(5, 7)
}

function getDay (date) {
  try {
    date = date.toISOString()
  }
  catch (error) {
    console.error(error.stack)
  }
  return date.slice(8, 10)
}

function filterTwoDigitDirs (list) {
  return list.filter(file => {
    return /^[0-9]{2}$/.test(file)
  })
}

function filterYears (list) {
  return list.filter(file => {
    return /^[0-9]{4}$/.test(file)
  })
}

// function filterImages (list) {
//   return list.filter(helper.isImage)
// }

function filterEvents (files) {
  return files.filter(file => {
    return /([0-9]{4}-)?([01][0-9]-)?[0-3][0-9]_.*/.test(file)
  })
}

function getFiles (directory) {
  return new Promise((fulfill, reject) => {
    fs.readdir(directory, (error, files) => {
      if (error) {
        if (error.code === 'ENOENT') fulfill([])
        else reject(error)
      }
      else {
        fulfill(files)
      }
    })
  })
}

function createPeriodObject (year, month, events, baseURL) {
  const periodObject = {
    year: year,
    month: month,
    url: baseURL + '/' + year + '/' + month,
    events: events.map(event => {
      const dateString = event.split('_', 1)[0]
      const name = event
        .split('_')
        .slice(1)
        .join('_')
      const day = dateString
        .split('-')
        .pop()
      const date = new Date(`${year}-${month}-${day}`)

      return {
        name: name.replace(/[-_]/g, ' '),
        date: date instanceof Date && isFinite(date)
          ? date
            .toISOString()
            .slice(0, 10)
          : null,
        url: [
          baseURL,
          date.getFullYear(),
          getMonth(date),
          getDay(date),
          name,
        ].join('/'),
      }
    }),
  }

  return periodObject
}

function getEventDirectory (year, month, day, eventName, photosDirectory) {
  eventName = util.format('%s-%s-%s_%s', year, month, day, eventName)

  return path.join(photosDirectory, year, month, eventName)
}

function getImagesForEvent (year, month, day, eventName, photosDirectory) {
  return getFiles(
    getEventDirectory(year, month, day, eventName, photosDirectory)
  )
}

function getEventsForMonth (year, month, photosDirectory, baseURL) {
  const monthDirectory = path.join(photosDirectory, year, month)

  return getFiles(monthDirectory)
    .then(filterEvents)
    .then(events => {
      return createPeriodObject(year, month, events, baseURL)
    })
    .catch(error => console.error(error.stack))
}

function getMonthsForYear (year, photosDirectory, baseURL) {
  const yearDirectory = path.join(photosDirectory, year)

  return getFiles(yearDirectory)
    .then(files => {
      // Find unique available months from directory and event names
      return filterMonths(files)
        .concat(filterEvents(files)
          .map(file => {
            return file.slice(5, 7)
          }))
        .filter((element, index, array) => {
          return array.indexOf(element) === index
        })
    })
    .then((months) => {
      return Promise.all(months.map((month) => {
        return getEventsForMonth(year, month, photosDirectory, baseURL)
      }))
    })
    .then((months) => {
      return {
        year,
        url: `${baseURL}/${year}`,
        months,
      }
    })
    .catch(error => console.error(error.stack))
}


module.exports = {
  getFiles,
  getEventDirectory,
  getImagesForEvent,
  getMonthsForYear,
  getEventsForMonth,
  filterYears,
  filterMonths,
  filterDays,
  filterEvents,
  // filterImages,
  // createPeriodObject
}
