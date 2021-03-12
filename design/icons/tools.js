/* eslint-disable id-length */

import svgKit from '../../svgKit.js'

const defaults = {
  width: 26,
  height: 26,
  scale: 10,
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
        d: 'M11,0' +
           'v2' +
           'a1,1 0 0 0 4,0' +
           'v-2' +
           'c1,0 2,1 2,4' +
           's-2,3 -2,5' +
           'v15' +
           'a1,1 0 0 1 -4,0' +
           'v-15' +
           'c0,-2 -2,-2 -2,-5' +
           's1,-4 2,-4' +
           'z',
      }],
    ],
  ]
}
