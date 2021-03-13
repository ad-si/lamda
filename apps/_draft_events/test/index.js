import url from 'url'
import path from 'path'
import runTest from 'ava'
import loadEvents from '../modules/loadEvents'

const dirname = path.dirname(url.fileURLToPath(import.meta.url))

runTest.only('Processing of events', () => {
  return loadEvents(path.join(dirname, 'events'))
})
