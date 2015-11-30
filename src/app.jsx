import React from 'react'
import Radium from 'radium'

import LeftNav from 'material-ui/lib/left-nav'
import MenuIcon from 'react-material-icons/icons/navigation/menu'

import styles from './styles'

const menuItems = [
  {
    route: 'map',
    text: 'Map'
  }
]

@Radium
export default class App extends React.Component {
  render() {
    return (
      <div style={styles.app}>
        <div>
          {this.props.children}
        </div>
        <MenuIcon
          onClick={() => {
            this.refs.nav.toggle()
          }}
          style={styles.menuButton}/>
        <LeftNav
          ref='nav'
          docked={false}
          menuItems={menuItems}/>
      </div>
    )
  }
}
