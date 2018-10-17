'use strict'

function updateCursorPosition () {
  const displayInUTC = true
  const now = new Date()
  const minuteOfDay = displayInUTC
    ? now.getUTCHours() * 60 + now.getUTCMinutes()
    : now.getHours() * 60 + now.getMinutes()
  const percentageOfDay = (minuteOfDay / 14.40) + '%'
  cursor.style = 'left:' + percentageOfDay
  cursor.title = displayInUTC
    ? now.getUTCHours() + ':' + now.getUTCMinutes()
    : now.getHours() + ':' + now.getMinutes()
}

const todayElement = document.getElementById('today')
const cursor = document.createElement('div')
cursor.classList.add('cursor')

todayElement
  .querySelector('.day')
  .appendChild(cursor)

updateCursorPosition()
setInterval(updateCursorPosition, 20000)
