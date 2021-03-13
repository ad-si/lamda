import path from 'path'
import fsp from 'fs-promise'
import yaml from 'js-yaml'
import Interval from '@datatypes/interval'
import moment from '@datatypes/moment'

const yamlRegex = /\.ya?ml$/i


export default function (eventsPath, request) {
  return fsp
    .readdir(eventsPath)
    .then(filePaths =>
      filePaths.filter(filePath => yamlRegex.test(filePath)),
    )
    .then(filteredPaths => filteredPaths
      .map(filePath => {
        const absoluteFilePath = path.join(eventsPath, filePath)

        return fsp
          .readFile(absoluteFilePath)
          .then(fileContent => {
            const eventObject = yaml.load(
              fileContent,
              {filename: filePath},
            )
            let timeString = filePath.replace(yamlRegex, '')
            let interval = {}

            if (!timeString.includes('--')) {
              timeString = moment.default(timeString)
                .intervalString
            }
            else {
              interval = new Interval(timeString)
            }

            Object.assign(eventObject, {
              interval,
              fileName: filePath,
              singleViewURL: request.app.locals.runsStandalone
                ? `/${filePath}`
                : `/files/Events/${filePath}`,
              baseName: timeString,
              title: eventObject.title
                ? eventObject.title
                : eventObject.type
                  ? eventObject.type
                    .slice(0, 1)
                    .toUpperCase() +
                    eventObject.type.slice(1)
                  : JSON.stringify(eventObject,
                  ),
              tooltipText:
                // TODO: Print human readable duration
                `Duration: ${interval.duration}\n` +
                (interval.start && interval.start.string.substr(0, 16)) +
                ' to\n' +
                (interval.end &&
                  interval.end.string
                    .substr(0, 16)
                    .replace(/T/g, ' ')),
            })

            return eventObject
          })
          .catch(error => {
            console.error(error.stack)
            return null
          })
      }),
    )
    .then(filePromises => Promise.all(filePromises))
    .catch(error => {
      if (!error.message.includes('no such file or directory')) {
        throw error
      }
      console.error(error.stack)
      return null
    })
}
