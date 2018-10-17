const path = require('@datatypes/path')
const fsp = require('fs-promise')
const yaml = require('js-yaml')
const Instant = require('@datatypes/moment').Instant

module.exports = {
  command: 'create',
  desc: 'Create a new thing in main things directory',
  builder: {
    directory: {
      default: '.',
    },
  },
  handler: (options) => {
    // TODO
  },
}
