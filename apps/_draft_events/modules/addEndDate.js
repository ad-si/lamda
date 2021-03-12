import momentFromString from '@datatypes/moment'

export default function (events) {
  return events
    .map(event => {
      event.endDate = momentFromString(event.startDate)
        .add(event.duration, 'minutes')
        .toDate()

      return event
    })
    .sort((previous, current) => previous.startDate - current.startDate)
}
