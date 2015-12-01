import React from 'react'
import Radium from 'radium'

import LocalMap from '../../components/LocalMap'

import styles from './styles'

@Radium
export default class Map extends React.Component {
  render() {
    return (
      <div style={styles.map}>
        <LocalMap/>
      </div>
    )
  }
}
