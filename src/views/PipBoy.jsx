import React from 'react';
import Sidebar from '../components/Sidebar';

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
  }

  static childContextTypes = {
    sendCommand: React.PropTypes.func.isRequired,
  }

  render() {
    return (
      <div style={styles.app}>
        <Sidebar/>
        <div style={styles.content}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
