import {
  constants
} from 'pipboylib'

const {
  channels
} = constants

export const SERVER_HEARTBEAT = 'SERVER_HEARTBEAT'
export const SERVER_HANDSHAKE = 'SERVER_HANDSHAKE'
export const SERVER_BUSY = 'SERVER_BUSY'
export const SERVER_DATABASE_UPDATE = 'SERVER_DATABASE_UPDATE'
export const SERVER_LOCALMAP_UPDATE = 'SERVER_LOCALMAP_UPDATE'
export const SERVER_COMMAND_REQUEST = 'SERVER_COMMAND_REQUEST'
export const SERVER_COMMAND_RESPONSE = 'SERVER_COMMAND_RESPONSE'

export function toType(channel) {
  switch (channel) {
    case channels.Heartbeat:
      return SERVER_HEARTBEAT
    case channels.Handshake:
      return SERVER_HANDSHAKE
    case channels.Busy:
      return SERVER_BUSY
    case channels.DatabaseUpdate:
      return SERVER_DATABASE_UPDATE
    case channels.LocalMapUpdate:
      return SERVER_LOCALMAP_UPDATE
    case channels.CommandRequest:
      return SERVER_COMMAND_REQUEST
    case channels.CommandResponse:
      return SERVER_COMMAND_RESPONSE
    default:
      throw 'Server sent a payload on an unknown channel!'
  }
}
