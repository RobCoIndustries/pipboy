import React from 'react'
import { render } from 'react-dom'

import { PropTypes, Router, Route, IndexRoute } from 'react-router'

import Radium from 'radium'
import invariant from 'invariant'

// Views
import Map from './views/Map'

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
        this.props.history.pushState(null, "map")

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
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}

App.contextTypes = { history: PropTypes.history }

class ServerSelection extends React.Component {
  render() {
    return (
      <span>
        Connecting to first found server...
      </span>
    )
  }
}

render((
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={ServerSelection}/>
      <Route path="map" component={Map}/>
    </Route>
  </Router>
), document.getElementById('app'))
