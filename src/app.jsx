import React from 'react';
import { render } from 'react-dom';

import { PropTypes, Router, Route, IndexRoute } from 'react-router';

// Views
import Map from './views/Map';
import About from './views/About';

import ServerSelection from './views/ServerSelection';
import PipBoy from './views/PipBoy';

import {
  connection,
  status,
} from 'pipboylib';

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'no-wrap',
    alignItems: 'stretch',
    height: '100%',
    width: '100%',
  },
};

const {
  discover,
  createSocket,
  sendPeriodicHeartbeat,
  createConnectionSubject,
} = connection;

const {
  connected,
} = status;

import {
  toType,
} from './constants/server_types';

import dispatcher from './dispatcher';

export default class App extends React.Component {
  static displayName = 'PipBoyApp';

  static propTypes = {
    children: React.PropTypes.node,
    history: React.PropTypes.object,
  }

  static childContextTypes = {
    sendCommand: React.PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
  }

  getChildContext = () => ({
    sendCommand: this.sendCommand,
  })

  componentWillMount() {
    discover()
      .then(server => createSocket(server.info.address))
      .then(socket => {
        this.cancelHeartbeat = sendPeriodicHeartbeat(socket);
        this.connection = createConnectionSubject(socket);
        this.subscription = this.connection.subscribe(x => {
          dispatcher.dispatch({
            type: toType(x.type),
            payload: x.payload,
          });
        });

        return connected(this.connection);
      })
      .then(() => {
        this.props.history.pushState(null, '/pipboy/about');

        // Get initial LocalMap state
        this.sendCommand('RequestLocalMapSnapshot');
      })
      .catch(err => {
        throw err;
      });
  }

  sendCommand = (type, ...args) => {
    if (this.connection) {
      this.connection.onNext([type, ...args]);
    }
  }

  render() {
    return (
      <div style={styles.app}>
        { this.props.children }
      </div>
    );
  }
}

App.contextTypes = { history: PropTypes.history };

render((
  <Router>
    <Route path='/' component={App}>
      <IndexRoute component={ServerSelection} />
      <Route path='pipboy' component={PipBoy}>
        <Route path='map' component={Map}/>
        <Route path='about' component={About}/>
      </Route>
    </Route>
  </Router>
), document.getElementById('app'));
