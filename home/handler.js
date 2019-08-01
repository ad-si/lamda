module.exports = (context, callback) => {
  callback(
    undefined,
    `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Test</title>
    </head>
    <body>
      Just some test content.
    </body>
    </html>
    `
  )
}
