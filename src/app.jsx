import React from 'react';
import { render } from 'react-dom';

import { PropTypes, Router, Route, IndexRoute } from 'react-router';

// Views
import Map from './views/Map';
import About from './views/About';

import ServerSelection from './views/ServerSelection';
import PipBoy from './views/PipBoy';

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

export default class App extends React.Component {
  static displayName = 'PipBoyApp';

  static propTypes = {
    children: React.PropTypes.node,
    history: React.PropTypes.object,
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
      <Route path='pipboy/:ip' component={PipBoy}>
        <Route path='About' component={About}/>
        <Route path='Map' component={Map}/>
      </Route>
    </Route>
  </Router>
), document.getElementById('app'));
