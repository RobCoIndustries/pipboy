import React from 'react'
import { render } from 'react-dom'

import { PropTypes, Router, Route, IndexRoute } from 'react-router'

import invariant from 'invariant'

// Views
import Map from './views/Map'
import About from './views/About'

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
        this.props.history.pushState(null, "/pipboy/about")

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
        <div style={styles.content}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

App.contextTypes = { history: PropTypes.history };

class ServerSelection extends React.Component {
  render() {
    return (
      <span>
        Connecting to first found server...
      </span>
    )
  }
}

class PipBoy extends React.Component {
  render() {
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

render((
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={ServerSelection} />
      <Route path="pipboy" component={PipBoy}>
        <Route path="map" component={Map}/>
        <Route path="about" component={About}/>
      </Route>
    </Route>
  </Router>
), document.getElementById('app'))
