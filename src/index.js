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

var React = require('react');
var ReactDOM = require('react-dom');
var JSONTree = require('react-json-tree');

const theme = {
  scheme: 'sogreen',
  author: 'RobCo Industries (https://github.com/RobCoIndustries)',
  base00: '#003000',
  base01: '#203020',
  base02: '#004000',
  base03: '#204020',
  base04: '#005000',
  base05: '#205020',
  base06: '#006000',
  base07: '#206020',
  base08: '#007000',
  base09: '#207020',
  base0A: '#008000',
  base0B: '#208020',
  base0C: '#009000',
  base0D: '#00B000',
  base0E: '#00D000',
  base0F: '#00F000'
};


discover()
  .then(server => createSocket(server.info.address))
  .then(socket => {
    sendPeriodicHeartbeat(socket)
    return createConnectionSubject(socket)
  })
  .then(subject => {
    connected(subject)
      .then(handshake => {
        console.log("Connected");
        const database = subject
          .filter(x => x.type === channels.DatabaseUpdate)
          .map(x => parseBinaryDatabase(x.payload))
          .scan(aggregateBundles, {})
          .map(x => generateTreeFromDatabase(x))

        // Update our database display
        // TODO: Only update the db tree when in view
        database
          .subscribe(db => {
            ReactDOM.render(<JSONTree data={ db } theme={ theme } />, document.getElementById('inspector'));
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
