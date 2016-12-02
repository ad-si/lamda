module.exports = (request, response) => {
  const availableFields = {
    theme: ['light', 'dark'],
    owner: {},
  }

  response.render('profile', {
    page: 'profile',
    owner: request.app.locals.config.owner,
    availableFields,
  })
}
