/* eslint-disable id-length */

import svgKit from '../../svgKit.js'

const defaults = {
  width: 26,
  height: 26,
  scale: 1,
}

export const version = '0.3.0'

export function shaven (conf) {
  conf = svgKit.applyDefaults(conf, defaults)

  return [
    'svg', {
      width: conf.scaledWidth,
      height: conf.scaledHeight,
      viewBox: [0, 0, conf.width, conf.height].join(),
    },
    ['g',
      ['path', {
        d: 'M7,6' +
          'h12' +
          'l2,14' +
          'h-6' +
          'l-2,-7' +
          'l-2,7' +
          'h-6' +
          'z',
      }],
    ],
  ]
}
