import {
  connection,
  decoding,
  status,
  constants
} from 'pipboylib';

import {
  Observable
} from 'rx'

const {
  discover,
  createSocket,
  sendPeriodicHeartbeat,
  createConnectionSubject
} = connection

const {
  parseBinaryMap,
  parseBinaryDatabase,
  aggregateBundles,
  generateTreeFromDatabase
} = decoding

const {
  connected
} = status

const {
  channels
} = constants

discover()
  .then(server => createSocket(server.info.address))
  .then(socket => {
    sendPeriodicHeartbeat(socket)
    return createConnectionSubject(socket)
  })
  .then(subject => {
    connected(subject)
      .then(handshake => {
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

        subject.onNext(['RequestLocalMapSnapshot'])
        const localmap = subject
          .filter(x => x.type === channels.LocalMapUpdate)
          .throttle(1000 / 30) // 30 FPS hard limit
          .doOnNext(x => {
            subject.onNext(['RequestLocalMapSnapshot'])
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
                data[offset] = 0.1 * val
                data[offset + 1] = val
                data[offset + 2] = 0.1 * val
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
            context.putImageData(image, 0, 0)
          })

        const database = subject
          .filter(x => x.type === channels.DatabaseUpdate)
          .map(x => parseBinaryDatabase(x.payload))
          .scan(aggregateBundles, {})
          .map(x => generateTreeFromDatabase(x))

        database
          .map(x => x.Map.World.Player)
          .map(x => x.Rotation)
          .distinctUntilChanged()
          .subscribe(rotation => {
            arrow.style.transform = `rotate(${rotation}deg)`
          })
      })
      .catch(err => {
        console.error('Couldn\'t establish connection!', err);
        console.error(err.stack);
      })
  })
  .catch(err => {
    throw err
  })
