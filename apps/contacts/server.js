import express from 'express'
import setupRouting from './modules/setupRouting.js'


const app = express()
const isDevMode = app.get('env') === 'development'
const runsStandalone = true  // TODO: !module.parent

if (runsStandalone) {
  setupRouting({app, runsStandalone, isDevMode})
  const port = 3000
  app.listen(
    port,
    () => console.info(`App listens on http://localhost:${port}`),
  )
}

export default function (locals) {
  setupRouting({
    app,
    locals,
    runsStandalone,
    isDevMode,
  })
  return app
}

export const isCallback = true
