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

import {
  createPipBoy
} from './pipboy';

import {
  createLocalMap
} from './localmap';

import {
  createInspector
} from './inspector';

export default function main() {
  // TODO: List available servers rather than picking the first
  discover()
    .then(server => createSocket(server.info.address))
    .then(socket => {
      sendPeriodicHeartbeat(socket)
      return createConnectionSubject(socket)
    })
    .then(subject => {
      connected(subject)
        .then(handshake => {
          let pipboy = createPipBoy(subject);
          //createLocalMap(pipboy);
          createInspector(pipboy, document.querySelector("#inspector"));
          window.pipboy = pipboy;
        })
        .catch(err => {
          console.error('Couldn\'t establish connection!', err);
          console.error(err.stack);
        })
    })
    .catch(err => {
      throw err
    })
}
