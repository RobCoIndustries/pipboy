import {
  decoding,
} from 'pipboylib';

const {
  parseBinaryDatabase,
  aggregateBundles,
} = decoding;

import {
  SERVER_DATABASE_UPDATE,
} from '../constants/server_types';

export default function Database(state, action) {
  if (!state) {
    state = {};
  }

  const payload = action.payload;

  switch (action.type) {
  case SERVER_DATABASE_UPDATE:
    return aggregateBundles(state, parseBinaryDatabase(payload));

  default:
    return state;
  }
}
