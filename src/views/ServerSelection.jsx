import React from 'react';

import color from 'color';

import { withStore } from 'fluorine-lib';

import defaultColor from '../constants/defaultColor';

import {
  connection,
} from 'pipboylib';

const {
  createDiscovery,
} = connection;

const styles = {
  deviceTable: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  table: {
    display: 'table',
    borderCollapse: 'separate',
    borderSpacing: '2px',

    position: 'relative',
    textAlign: 'center',
  },
  thead: {
    display: 'table-header-group',
    verticalAlign: 'middle',
  },
  tbody: {
    display: 'table-row-group',
    verticalAlign: 'middle',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: defaultColor,
    padding: '5px',
  },
  tr: {
    display: 'table-row',
    verticalAlign: 'inherit',
  },
  td: {
    width: '100px',
    padding: '5px',
    verticalAlign: 'inherit',
    display: 'table-cell',
    color: color(defaultColor).darken(0.3).hexString(),
  },
  th: {
    fontWeight: 'bold',
    width: '100px',
    padding: '5px',
    verticalAlign: 'inherit',
    display: 'table-cell',
  },
};

@withStore(createDiscovery()
  .filter(s => s.info && s.info.address)
  .map(s => {
    return {
      device: s.MachineType,
      busy: s.Busy,
      address: s.info.address,
    };
  })
  .scan((state, servers) => state.concat(servers), [])
, 'servers')
export default class ServerSelection extends React.Component {
  static displayName = 'ServerSelection';

  static propTypes = {
    history: React.PropTypes.object,
    route: React.PropTypes.object,
    servers: React.PropTypes.any,
  }

  selectServer(server) {
    this.props.history.pushState(null, `/${server}/Map`);
  }

  render() {
    return (
      <div style={styles.deviceTable}>
      <table style={styles.table} >
        <thead style={styles.thead}>
          <tr style={styles.tr}>
            <th style={styles.th}>Device</th>
            <th style={styles.th}>Busy</th>
            <th style={styles.th}>Address</th>
          </tr>
        </thead>
        <tbody style={styles.tbody}>
        {this.props.servers.map((server) => {
          return (
            <tr key={server.address} onClick={this.selectServer.bind(this, server.address)} style={styles.tr}>
              <td style={styles.td}>{server.device}</td>
              <td style={styles.td}>{server.busy ? 'yes' : 'no'}</td>
              <td style={styles.td}>{server.address}</td>
            </tr>
          );
        })}
        </tbody>
      </table>
      </div>
    );
  }
}
