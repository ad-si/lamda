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
        d: 'M7,8' +

           'h12' +
           'l2,10' +
           'h-7' +
           'l-1,-3' +
           'l-1,3' +
           'h-7' +
           'z',
      }],
    ],
  ]
}
