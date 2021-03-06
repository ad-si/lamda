/* eslint-disable id-length */

import svgKit from '../../svgKit.js'

export function shaven (conf) {
  const defaults = {
    width: 26,
    height: 26,
    scale: 1,
  }

  conf = svgKit.applyDefaults(conf, defaults)

  return [
    'svg', {
      width: conf.scaledWidth,
      height: conf.scaledHeight,
      viewBox: [0, 0, conf.width, conf.height].join(),
    },
    ['g',
      ['path', {
        d: 'M7,1' +
          'h12' +
          'l2,24' +
          'h-4' +
          'l-4,-18' +
          'l-4,18' +
          'h-4' +
          'z',
      }],
    ],
  ]
}
