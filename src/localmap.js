import {
  decoding,
  status,
  constants
} from 'pipboylib';

const {
  parseBinaryMap
} = decoding

const {
  channels
} = constants

import {
  Observable
} from 'rx';

export function createLocalMap(pipboy) {
  // Create Canvas for Fallout 4 Map
  const canvas = document.getElementById('map')
  const context = canvas.getContext('2d')

  let image;
  let empty;
  let prev;

  const arrow = document.getElementById('arrow')
  arrow.style.left = '50%'
  arrow.style.top = '50%'

  canvas.style.WebkitFilter = 'hue-rotate(0deg)'

  pipboy.subject.onNext(['RequestLocalMapSnapshot'])

  const localmap = pipboy.subject
    .filter(x => x.type === channels.LocalMapUpdate)
    .throttle(1000 / 30) // 30 FPS hard limit
    .doOnNext(x => {
      pipboy.subject.onNext(['RequestLocalMapSnapshot'])
    })
    .map(x => parseBinaryMap(x.payload))
    .distinctUntilChanged()

  const resize = Observable
    .fromEvent(window, 'resize')
    .merge(Observable.just())

  localmap
    .first()
    .combineLatest(resize, x => ({
      x: window.innerWidth / x.width,
      y: window.innerHeight / x.height
    }))
    .subscribe(scale => {
      canvas.style.transform = `scale(${scale.x},${scale.y})`
      canvas.style.transformOrigin = '0 0'
    })

  localmap
    .filter(map => {
      if (!empty) {
        empty = new Buffer(map.pixels.length)
      }
      return !map.pixels.equals(empty)
    })
    .map(map => {
      const {
        width,
        height,
        pixels
      } = map

      if (!image) {
        image = context.createImageData(width, height)
      }

      const data = image.data;

      for (let i = 0; i < pixels.length; i++) {
        const val = pixels[i]
        if (!prev || val !== prev[i]) {
          const offset = i * 4
          data[offset] = val
          data[offset + 1] = val
          data[offset + 2] = val
          data[offset + 3] = 255
        }
      }

      prev = pixels
      return {
        image,
        map
      }
    })
    .subscribe(res => {
      const {
        image,
        map
      } = res

      canvas.height = map.height
      canvas.width = map.width

      context.globalCompositeOperation = 'source-over'
      context.putImageData(image, 0, 0)
      context.globalCompositeOperation = 'multiply'
      context.fillStyle = 'rgb(25, 255, 25)'
      context.fillRect(0, 0, map.width, map.height)
    })

  pipboy.database
    .map(x => x.Map.World.Player)
    .map(x => x.Rotation)
    .distinctUntilChanged()
    .subscribe(rotation => {
      arrow.style.transform = `rotate(${rotation}deg)`
    })
}
