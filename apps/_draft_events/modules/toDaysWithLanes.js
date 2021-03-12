export default function (day) {
  const lanes = []
  let laneIndex = 0

  day.events.forEach(event => {
    while ( // there is an overlap of events
      lanes[laneIndex] &&
      lanes[laneIndex].some(laneEvent => !(
        (
          laneEvent.interval.end.upperLimit <
          event.interval.start.lowerLimit
        ) || (
          event.interval.end.upperLimit <
          laneEvent.interval.start.lowerLimit
        )
      ))
    ) {
      laneIndex++
    }

    if (!Array.isArray(lanes[laneIndex])) {
      lanes[laneIndex] = []
    }
    lanes[laneIndex].push(event)
    laneIndex = 0
  })

  day.lanes = lanes
  delete day.events

  return day
}
