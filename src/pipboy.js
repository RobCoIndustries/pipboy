import {
  connection,
  decoding,
  status,
  constants
} from 'pipboylib';

import {
  Observable
} from 'rx';

const {
  discover,
  createSocket,
  sendPeriodicHeartbeat,
  createConnectionSubject
} = connection

const {
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

export class PipBoy {
  constructor(subject) {
    this.subject = subject;
    const database = subject
      .filter(x => x.type === channels.DatabaseUpdate)
      .map(x => parseBinaryDatabase(x.payload))
      .scan(aggregateBundles, {})
      .map(x => generateTreeFromDatabase(x))

    this.database = database;
  }
}

export const createPipBoy = function createPipBoy(subject) {
  return new PipBoy(subject);
}
