import {
  Subject,
  BehaviorSubject
} from 'rx'

import {
  decoding
} from 'pipboylib';

const {
  parseBinaryMap
} = decoding

const _size = 1920 * 1080 * 4
const _empty = new Buffer(1920 * 1080)
const _initial = new Uint8ClampedArray(_size)

const pipe = new Subject()
const stream = new BehaviorSubject(new ImageData(_initial, 1920, 1080))

pipe
  .map(x => parseBinaryMap(x).pixels)
  .filter(x => !x.equals(_empty))
  .map(pixels => {
    const data = new Uint8ClampedArray(_size)

    for (let i = 0; i < pixels.length; i++) {
      const val = pixels[i]
      const offset = i * 4
      data[offset] = val
      data[offset + 1] = val
      data[offset + 2] = val
      data[offset + 3] = 255
    }

    return new ImageData(data, 1920, 1080)
  })
  .subscribe(x => {
    stream.onNext(x)
  })

export function nextLocalMap(payload) {
  pipe.onNext(payload)
}

export default stream.asObservable()
