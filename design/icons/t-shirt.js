const svgKit = require('../../svgKit.js')
const defaults = {
  width: 26,
  height: 26,
  scale: 1,
}

module.exports.targetVersion = '0.3.0'

module.exports.shaven = function (conf) {

  conf = svgKit.applyDefaults(conf, defaults)

  return [
    'svg', {
      width: conf.scaledWidth,
      height: conf.scaledHeight,
      viewBox: [0, 0, conf.width, conf.height].join(),
    },
    ['g',
      ['path', {
        'd': 'M10,1' +
           'c0,1 6,1 6,0' +
           'l4,1' +
           'l6,6' +
           'l-2,4' +
           'l-4,-2' +
           'v14' +
           'h-14' +
           'v-14' +
           'l-4,2' +
           'l-2,-4' +
           'l6,-6' +
           'z',
      }],
    ],
  ]
}
