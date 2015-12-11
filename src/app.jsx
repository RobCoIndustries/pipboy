import React from 'react'
import invariant from 'invariant'

import { Link } from 'react-router'

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
    padding: 10
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
    return (
      <div style={styles.app}>
          <div className="pure-menu custom-restricted-width">
            <ul className="pure-menu-list">
              <li className="pure-menu-item"><Link className="pure-menu-link" to="/map">Map</Link></li>
              <li className="pure-menu-item"><Link className="pure-menu-link" to="/about">About</Link></li>
            </ul>
          </div>
        <div style={styles.content}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
