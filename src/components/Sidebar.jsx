import React from 'react'
import { withStore } from 'fluorine-lib'
import { Link } from 'react-router'
//import ipcMain from 'electron'
const ipcRenderer = require('electron').ipcRenderer;

import {
  decoding
} from 'pipboylib'

import Database from '../stores/Database'
import dispatcher from '../dispatcher'

const { generateTreeFromDatabase } = decoding

var remote = require('remote');
var BrowserWindow = remote.require('browser-window');
var win = BrowserWindow.getFocusedWindow();

@withStore(dispatcher
  .reduce(Database)
  .map(x => generateTreeFromDatabase(x))
  .filter(x => x && x.Status)
  .map(x => x.Status.EffectColor)
  .map(effectColor => {
    let effectColors = effectColor.map(x => Math.round(x*255) )
    let effect = {
      red: effectColors[0],
      green: effectColors[1],
      blue: effectColors[2]
    }
    return `rgb(${effect.red},${effect.green},${effect.blue})`
  })
  .distinctUntilChanged(),
  'color')
export default class Sidebar extends React.Component {
  handleFullscreen() {
    win.setFullScreen(!(win.isFullScreen()));
  }
  render() {
    const styles = {
      container: {
        height: '100%',
        width: 200,
        padding: 10,
        color: this.props.color,
        "-webkit-app-region": "drag"
      },
      sidebar: {
        borderRight: `3px solid ${this.props.color}`,
        paddingRight: 10,
        height: '100%',
        width: '100%'
      },
      li: {
        width: '100%',
        marginBottom: 5,
        textTransform: 'uppercase',
        "-webkit-app-region": "no-drag"
      },
      item: {
        base: {
          width: '100%',
          padding: 5,
          background: 'none',
          color: this.props.color
        },
        active: {
          background: this.props.color,
          color: '#000'
        }
      }
    }

    return (
      <div style={styles.container}>
        <div style={styles.sidebar}>
          <ul>
            <li style={styles.li}>
              <Link
                to="/map"
                activeStyle={styles.item.active}
                style={styles.item.base}>
                Map
              </Link>
            </li>

            <li style={styles.li}>
              <Link
                to="/about"
                activeStyle={styles.item.active}
                style={styles.item.base}>
                About
              </Link>
            </li>

            <li style={styles.li}>
              <span
                onClick={this.handleFullscreen}
                activeStyle={styles.item.active}
                style={styles.item.base}>
                Fullscreen
              </span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
