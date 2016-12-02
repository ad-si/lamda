module.exports = (request, response) => {
  const availableSettings = {
    theme: ['light', 'dark'],
    owner: {},
  }

  response.render('settings', {
    page: 'settings',
    settings: request.app.locals.config,
    availableSettings,
  })
}
