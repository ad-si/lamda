import url from 'url'
import path from 'path'

import express from 'express'

import index from './routes/index'


const app = express()
const dirname = path.dirname(url.fileURLToPath(import.meta.url))

app.set('views', `${dirname}/views`)

app.get('/', index)

export default app
