import React from 'react'
import Radium from 'radium'
import invariant from 'invariant'

import {
  Subject
} from 'rx'

import {
  connection,
  status
} from 'pipboylib'

const {
  discover,
  createSocket,
  sendPeriodicHeartbeat,
  createConnectionSubject
} = connection

const {
  connected
} = status

import {
  toType
} from './constants/server_types'

import dispatcher from './dispatcher'
import styles from './styles'

@Radium
export default class App extends React.Component {
  state = {
    connected: false
  }

  childContextTypes = {
    sendCommand: React.PropTypes.func.isRequired
  }

  getChildContext = () => ({
    sendCommand: this.sendCommand
  })

  sendCommand = (type, ...args) => {
    if (this.connection) {
      invariant(typeof type === 'number', 'Expected number for type.')
      this.connection.onNext(arguments)
    }
  }

  componentWillMount() {
    // TODO: Implement a server selection
    discover()
      .then(server => createSocket(server.info.address))
      .then(socket => {
        this.cancelHeartbeat = sendPeriodicHeartbeat(socket)
        this.connection = createConnectionSubject(socket)
        this.subscription = this.connection.subscribe(x => {
          dispatcher.dispatch({
            type: toType(x.type),
            payload: x.payload
          })
        })

        return connected(this.connection)
      })
      .then(() => {
        this.setState({
          connected: true
        })
      })
  }

  render() {
    // TODO: Implement a loading screen
    if (!this.state.connection)
      return null

    return (
      <div style={styles.app}>
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}
