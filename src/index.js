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

        const localmap = subject
          .filter(x => x.type === channels.LocalMapUpdate)
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
          .map(map => {
            const {
              width,
              height,
              pixels
            } = map

            const image = context.createImageData(width, height)
            const data = image.data;

            for (let i = 0; i < (data.length / 4); i++) {
              const offset = i * 4
              const val = pixels.readUInt8(i)
              data[offset] = val
              data[offset + 1] = val
              data[offset + 2] = val
              data[offset + 3] = 255
            }

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
          .map(x => ({
            x: x.X || null,
            y: x.Y || null,
            // deg: x.Rotation || null // We'll only care about x and y here
          }))
          .distinctUntilChanged()
          .throttle(1000 / 30) // 60 FPS
          .subscribe(pos => {
            subject.onNext(['RequestLocalMapSnapshot'])
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