import path from 'path'
import nativeConsole from 'console'
const log = new nativeConsole.Console(process.stdout, process.stdin)

import inquirer from 'inquirer'
import fsp from 'fs-promise'
import yaml from 'js-yaml'
import userHome from 'user-home'


export default function () {
  const now = new Date()
  const startOfEvent = new Date()
  startOfEvent.setMinutes(0)

  const toIsoTime = date => date
    .toISOString()
    .slice(11, 16)
  const getDate = object => new Date(
    object.year,
    object.month,
    object.day,
    object.time.split(':')[0],
    object.time.split(':')[1],
  )

  const validateYear = value => /\d{4}/.test(value)
  const validateMonth = value => /\d{1,2}/.test(value)
  const validateDay = value => /\d{1,2}/.test(value)
  const validateTime = value => /\d{1,2}(:\d{2})?/.test(value)

  const startTimeQuestions = [
    {
      type: 'input',
      name: 'year',
      message: 'Start Year',
      default: now.getUTCFullYear(),
      validate: validateYear,
    },
    {
      type: 'input',
      name: 'month',
      message: 'Start Month',
      default: now.getUTCMonth() + 1,
      validate: validateMonth,
    },
    {
      type: 'input',
      name: 'day',
      message: 'Start Day',
      default: now.getUTCDate(),
      validate: validateDay,
    },
    {
      type: 'input',
      name: 'time',
      message: 'Start Time',
      default: toIsoTime(startOfEvent),
      validate: validateTime,
      filter: value =>
        ('00' + (value.includes(':') ? value : `${value}:00`)).slice(-5),
    },
  ]

  const mainQuestions = [
    {
      type: 'list',
      name: 'type',
      message: 'Event Type',
      choices: [
        'Sleep',
        'Nap',
        'Breakfast',
        'Lunch',
        'Dinner',
        'Snack',
        'Oral Hygiene',
        'Shower',
        'Movie',
        'TV Series',
        'Meeting',
        'Work',
        'Physical Exercise',
      ],
      default: 'Sleep',
      filter: value => value
        .toLowerCase()
        .replace(' ', '-'),
    },
    {
      when: answers =>
        ['movie', 'tv-series', 'meeting'].includes(answers.type),
      type: 'input',
      name: 'title',
      message: 'Event Title',
    },
    {
      when: answers => answers.type === 'meeting',
      type: 'input',
      name: 'with',
      message: 'With',
      filter: value => value
        .split(',')
        .map(item => item.trim()),
    },
    {
      when: answers => answers.type === 'work',
      type: 'input',
      name: 'project',
      message: 'Project',
    },
    {
      when: answers => answers.type === 'physical-exercise',
      type: 'list',
      name: 'subtype',
      message: 'Subtype',
      choices: [
        'Jogging',
        'Strength Training',
        'Swimming',
        'Football',
        'Cycling',
      ],
      filter: value => value.toLowerCase(),
    },
    {
      when: answers =>
        ['breakfast', 'lunch', 'dinner', 'snack'].includes(answers.type),
      type: 'input',
      name: 'items',
      message: 'Items',
      filter: value => value
        .split(',')
        .map(item => item.trim()),
    },
  ]

  const results = {}

  function getFileName (object) {
    const toIsoDateTime = date => date
      .toISOString()
      .slice(0, 16)

    const startDate = getDate(object.start)
    const startTime = toIsoDateTime(startDate)

    const endDate = getDate(object.end)
    const endTime = toIsoDateTime(endDate)
    let charsToSlice = 0

    if (object.start.year === object.end.year) {
      charsToSlice += 5
      if (object.start.month === object.end.month) {
        charsToSlice += 3
        if (object.start.day === object.end.day) {
          charsToSlice += 2
        }
      }
    }

    if (startTime.endsWith(endTime)) {
      throw new Error('Start and end moment must not be the same')
    }

    return `${startTime}--${endTime.slice(charsToSlice)}.yaml`
      .replace(/:/g, '')
  }

  inquirer
    .prompt(startTimeQuestions)
    .then(startAnswers => {
      const endTimeQuestions = startTimeQuestions.map(question => {
        return Object.assign(
          {},
          question,
          {
            message: question.message.replace('Start', 'End'),
            default: startAnswers[question.name],
          },
        )
      })

      // Months are indexed from 0 in JavaScript
      startAnswers.month -= 1
      results.start = startAnswers

      return inquirer.prompt(endTimeQuestions)
    })
    .then(endAnswers => {
      // Months are indexed from 0 in JavaScript
      endAnswers.month -= 1

      results.end = endAnswers
      return inquirer.prompt(mainQuestions)
    })
    .then(answers => {
      results.fileContent = answers
      results.fileName = getFileName(results)
      results.filePath = path.join(userHome, 'Events', results.fileName)

      return fsp.writeFile(results.filePath, yaml.safeDump(answers))
    })
    .then(() => {
      log.info(`✔︎ Successfully created event file ${results.filePath}`)
      log.dir(results.fileContent, {depth: null, colors: true})
    })
    .catch(log.error)
}
