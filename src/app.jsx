import React from 'react'
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
import Sidebar from './components/Sidebar'

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'no-wrap',
    alignItems: 'stretch',
    height: '100%',
    width: '100%'
  },
  content: {
    display: 'block',
    flexGrow: '1',
    padding: 10,
    width: '100%',
    height: '100%'
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
  }

  static childContextTypes = {
    sendCommand: React.PropTypes.func.isRequired
  }

  state = {
    connected: false
  }

  getChildContext = () => ({
    sendCommand: this.sendCommand
  })

  sendCommand = (type, ...args) => {
    if (this.connection) {
      this.connection.onNext([type, ...args])
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

        // Get initial LocalMap state
        this.sendCommand('RequestLocalMapSnapshot')
      })
      .catch(err => {
        throw err
      })
  }

  render() {
    // TODO: Implement a loading screen
    if (!this.state.connected) {
      return (
        <span>
          Connecting...
        </span>
      )
    }

    return (
      <div style={styles.app}>
        <Sidebar/>
        <div style={styles.content}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
