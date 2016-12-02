module.exports = (request, response) => {
  response.render(
    'index',
    {
      page: 'home',
    }
  )
}
