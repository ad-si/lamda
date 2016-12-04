module.exports = (request, response) => {
  const data = [
    {
      title: 'Datum 1',
    },
    {
      title: 'Datum 2',
    },
    {
      title: 'Datum 3',
    },
  ]

  response.render('index', {
    page: 'boilerplate',
    data: data,
  })
}
