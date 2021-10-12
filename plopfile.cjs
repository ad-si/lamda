module.exports = function (plop) {
  const thingsPath = process.env.THINGS

  plop.setGenerator('thing', {
    description: 'Generate files for a new thing',
    prompts: [
      {
        type: 'input',
        name: 'date',
        message: 'Filename of thing',
      },
      {
        type: 'input',
        name: 'slug',
        message: 'Slug of thing (for filename / id)',
      },
      {
        type: 'input',
        name: 'title',
        message: 'Title of thing',
      },
      {
        type: 'input',
        name: 'articleNumber',
        message: 'Article number of thing',
      },
    ],
    actions: [
      {
        type: 'add',
        path: `${thingsPath}/{{date}}_{{slug}}/main.yaml`,
        templateFile: 'templates/thing.hbs'
      },
    ]
  })
}
