import moment from 'moment'
// const fakesome = require('fakesome')

// function getStartDate () {
//   const rangeStart = new Date()
//   const rangeEnd = new Date()
//   const daysBefore = 10
//   const daysAfter = 100
//
//   rangeStart.setDate(rangeStart.getDate() - daysBefore)
//   rangeEnd.setDate(rangeEnd.getDate() + daysAfter)
//
//   return fakesome.date(rangeStart, rangeEnd)
// }

// function getEndDate (startDate) {
//   const hourOffset = startDate.getHours() + fakesome.integer(1, 5)
//
//   return new Date(
//     new Date(startDate.getTime())
//       .setHours(hourOffset)
//   )
// }

export default function () {
  // const startDate = getStartDate()

  // return fakesome.array(100).object({
  //  title: fakesome.word,
  //  startDate: getStartDate,
  //  duration: function () {
  //    return fakesome.integer(15, 1500)
  //  }
  // })

  return [
    {
      title: 'First Event',
      startDate: moment()
        .hours(5)
        .toDate(),
      duration: 37,
    },
    {
      title: 'Second Event',
      startDate: moment()
        .hours(8)
        .toDate(),
      duration: 95,
    },
    {
      title: 'Third Event',
      startDate: moment()
        .hours(12)
        .toDate(),
      duration: 60,
    },
  ]
}
