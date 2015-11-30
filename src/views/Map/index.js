import React from 'react'
import Radium from 'radium'

import styles from './styles'

@Radium
export default class Map extends React.Component {
  render() {
    return (
      <div style={styles.map}>
      </div>
    )
  }
}
