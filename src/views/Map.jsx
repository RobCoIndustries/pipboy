import React from 'react';
import LocalMap from '../components/LocalMap';

const styles = {
  map: {
    display: 'block',
    height: '100%',
    width: '100%',
  },
};

export default class Map extends React.Component {
  static displayName = 'Map';

  render() {
    return (
      <div style={styles.map}>
        <LocalMap/>
      </div>
    );
  }
}
