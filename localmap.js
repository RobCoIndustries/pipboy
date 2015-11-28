import {
  connection,
  decoding,
  status,
  constants
} from 'pipboylib';

const {
  discover,
  createSocket,
  sendPeriodicHeartbeat,
  createConnectionSubject
} = connection

const {
  parseBinaryMap,
  createObservable,
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

const canvas = document.querySelector('#canvas');

discover()
  .then(server => createSocket(server.info.address))
  .then(socket => {
    sendPeriodicHeartbeat(socket)
    return createConnectionSubject(socket)
  })
  .then(subject => {
    connected(subject)
      .then(handshake => {
        const localMap = subject
          .filter(x => x.type === channels.LocalMapUpdate)
          .map(x => parseBinaryMap(x.payload))

        localMap
          .distinctUntilChanged()
          .subscribe(map => {
            const width = map.width;
            const height = map.height;
            const pixels = map.pixels;

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");

            context.fillStyle = "rgb(0,0,0)";
            context.clearRect(0, 0, canvas.width, canvas.height);

            const blockWidth = 1;
            const blockHeight = 1;
            let y = 0;

            for (var ii = 0; ii < pixels.length; ii++) {
              let x = ii % width;
              let y = ii / width;
              let gray = pixels.readUInt8(ii);

              context.fillStyle = "#" + gray + gray + gray;
              context.fillRect(x,y,blockWidth,blockHeight);
            }
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
          .subscribe(pos => {
            subject.observer.onNext(['RequestLocalMapSnapshot'])
        })

        // Render an initial canvas
        subject.observer.onNext(['RequestLocalMapSnapshot'])

      })
      .catch(err => {
        console.error('Couldn\'t establish connection!', err);
        console.error(err.stack);
      })
  })
  .catch(err => {
    throw err
  })
