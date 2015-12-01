import {
  constants
} from 'pipboylib'

const {
  channels
} = constants

export function toType(channel) {
  switch (channel) {
    case channels.Heartbeat:
      return 'SERVER_HEARTBEAT'
    case channels.Handshake:
      return 'SERVER_HANDSHAKE'
    case channels.Busy:
      return 'SERVER_BUSY'
    case channels.DatabaseUpdate:
      return 'SERVER_DATABASE_UPDATE'
    case channels.LocalMapUpdate:
      return 'SERVER_LOCALMAP_UPDATE'
    case channels.CommandRequest:
      return 'SERVER_COMMAND_REQUEST'
    case channels.CommandResponse:
      return 'SERVER_COMMAND_RESPONSE'
    default:
      throw 'Server sent a payload on an unknown channel!'
  }
}
