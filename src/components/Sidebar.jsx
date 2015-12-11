import React from 'react'
import { withStore } from 'fluorine-lib'

import {
  decoding
} from 'pipboylib'

import Database from '../stores/Database'
import dispatcher from '../dispatcher'

const { generateTreeFromDatabase } = decoding

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
  render() {
    const styles = {
      container: {
        width: 200,
        padding: 10,
        color: this.props.color
      },
      sidebar: {
        borderRight: `3px solid ${this.props.color}`
      }
    }

    return (
      <div style={styles.container}>
        <div style={styles.sidebar}>
        </div>
      </div>
    )
  }
}
