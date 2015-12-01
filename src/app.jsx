import React from 'react'
import Radium from 'radium'

import styles from './styles'

@Radium
export default class App extends React.Component {
  render() {
    return (
      <div style={styles.app}>
        <div>
          {this.props.children}
        </div>
        <button></button>
        <Sidebar/>
      </div>
    )
  }
}
