import React from 'react';

import Sidebar from '../components/Sidebar';

import {
  connection,
  status,
} from 'pipboylib';

const {
  createSocket,
  sendPeriodicHeartbeat,
  createConnectionSubject,
} = connection;

const {
  connected,
} = status;

import {
  toType,
} from '../constants/server_types';

import dispatcher from '../dispatcher';

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'no-wrap',
    alignItems: 'stretch',
    height: '100%',
    width: '100%',
  },
  content: {
    display: 'block',
    flexGrow: '1',
    padding: 10,
    width: '100%',
    height: '100%',
  },
};

export default class PipBoy extends React.Component {
  static displayName = 'PipBoy';

  static propTypes = {
    children: React.PropTypes.node,
    color: React.PropTypes.any,
    history: React.PropTypes.any,
    params: React.PropTypes.any,
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
    this.socket = createSocket(this.props.params.ip);
    // Redirect to server selection on disconnect (for now).
    // Since close always follows an emitted 'error' on socket, we'll only
    // redirect in close.
    this.socket.on('close', (hadError) => {
      if (hadError) {
        console.error('Connection to Fallout 4 server had an error. Redirecting to server selection screen.');
      }
      this.props.history.pushState(null, `/pipboy/${this.props.params.ip}`);
    });
    this.socket.on('timeout', () => {
      console.error('Fallout 4 timed out.');
      this.socket.destroy();
    });
    this.socket.setTimeout(2000);

    this.cancelHeartbeat = sendPeriodicHeartbeat(this.socket);
    this.connection = createConnectionSubject(this.socket);

    this.subscription = this.connection.subscribe(x => {
      dispatcher.dispatch({
        type: toType(x.type),
        payload: x.payload,
      });
    });
    connected(this.connection).then(() => {
      // this.props.history.pushState(null, 'map');
      this.setState({ connected: true });

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
      (this.state && this.state.connected) ?
      <div style={styles.app}>
        <Sidebar basepath={`/pipboy/${this.props.params.ip}`} />
        <div style={styles.content}>
          {this.props.children}
        </div>
      </div> :
      <div>
        <p>woo</p>
      </div>
    );
  }
}
