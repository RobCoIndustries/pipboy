import React from 'react';

import { withStore } from 'fluorine-lib';

import {
  decoding,
} from 'pipboylib';

const { generateTreeFromDatabase } = decoding;

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

import Database from '../stores/Database';
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

/*
@withStore(dispatcher
  .reduce(Database)
  .filter(x => x)
  .map(x => generateTreeFromDatabase(x))
  .filter(x => x && x.Status)
  .map(x => x.Status.EffectColor)
  .map(effectColor => {
    const effectColors = effectColor.map(x => Math.round(x * 255));
    const effect = {
      red: effectColors[0],
      green: effectColors[1],
      blue: effectColors[2],
    };
    return `rgb(${effect.red},${effect.green},${effect.blue})`;
  })
  .distinctUntilChanged(),
  'color')
  */
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
    console.log(this.props.params.ip);
    this.socket = createSocket(this.props.params.ip);
    // Redirect to server selection on disconnect (for now).
    // Since close always follows an emitted 'error' on socket, we'll only
    // redirect in close.
    this.socket.on('close', (hadError) => {
      if (hadError) {
        console.error('Connection to Fallout 4 server had an error. Redirecting to server selection screen.');
      }
      this.props.history.pushState(null, '/');
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
        <Sidebar color={this.props.color || 'rgb(255,100,100)'}
                 plugins={React.Children.map(this.props.children, (child) => {
                   return { name: child.displayName, path: `pipboy/${this.props.params.ip}/${child.displayName}` };
                 })} />
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
