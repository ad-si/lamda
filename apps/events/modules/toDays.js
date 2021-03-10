module.exports = (days, event) => {
  const eventDay = days.find(dayObject =>
    dayObject.date.string.substr(0, 10) ===
    event.interval.start.string.substr(0, 10)
  )

  if (eventDay) {
    eventDay.events.push(event)
  }

  return days
}
