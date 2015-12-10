import React from 'react'
import Radium from 'radium'
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
    display: 'block',
    height: '100%',
    width: '100%'
  }
}

@Radium
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
      <div>
        <ul className="nav">
          <li><Link to="/">Main</Link></li>
          <li><Link to="/map">Map</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
        {this.props.children}
      </div>
    )
  }
}
