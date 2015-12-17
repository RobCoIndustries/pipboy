import React from 'react';

import { withStore } from 'fluorine-lib';

import {
  connection,
} from 'pipboylib';

const {
  createDiscovery,
} = connection;

@withStore(createDiscovery()
  .filter(s => s.info && s.info.address)
  .map(s => s.info.address)
  .scan((state, servers) => state.concat(servers), [])
, 'servers')
export default class ServerSelection extends React.Component {
  static displayName = 'ServerSelection';

  static propTypes = {
    history: React.PropTypes.object,
    servers: React.PropTypes.any,
  }

  selectServer(server) {
    this.props.history.pushState(null, `/pipboy/${server}/Map`);
  }

  render() {
    return (
      (this.props.servers && this.props.servers.length > 0) ?
        <div>{this.props.servers.map(server =>
          <h1 key={server} onClick={this.selectServer.bind(this, server)}>{server}</h1>
        )}</div> :
      <h1>
        Finding servers...
      </h1>
    );
  }
}
