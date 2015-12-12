import React from 'react'

import { Observable } from 'rx'
import { withStore } from 'fluorine-lib'

import { decoding, constants } from 'pipboylib'
const { parseBinaryMap, generateTreeFromDatabase } = decoding
const { RequestLocalMapSnapshot } = constants.commands

import {
  SERVER_LOCALMAP_UPDATE
} from '../constants/server_types'

import PlayerArrow from './PlayerArrow'
import dispatcher from '../dispatcher'
import localmapStream from '../localmap_stream'
import Database from '../stores/Database'

const styles = {
  localMap: {
    display: 'block',
    position: 'relative',
    height: '100%',
    width: '100%',
    overflow: 'hidden'
  },
  canvas: {
    background: '#000',
    height: '100%',
    width: '100%'
  }
}

const db = dispatcher
  .reduce(Database)
  .map(x => generateTreeFromDatabase(x))

const position = db
  .map(x => x && x.Map.World.Player)
  .distinctUntilChanged()
  .map(x => ({
    x: x.X,
    y: x.Y,
    deg: x.Rotation || 0
  }))

@withStore(db
  .filter(x => x && x.Status)
  .map(x => x.Status.EffectColor)
  .map(x => {
    const color = x.map(x => Math.round(x * 255))
    return `rgb(${color[0]},${color[1]},${color[2]})`
  })
  .distinctUntilChanged(),
  'color')
@withStore(position, 'position')
@withStore(localmapStream, 'map')
export default class LocalMap extends React.Component {
  static contextTypes = {
    sendCommand: React.PropTypes.func.isRequired
  }

  componentWillMount() {
    this.context.sendCommand('RequestLocalMapSnapshot')
  }

  componentDidMount() {
    this.canvas = this.refs.canvas.getContext('2d')
    this.updateMap(this.props.map)

    this.updater = position
      .throttle(200)
      .subscribe(() => {
        this.context.sendCommand('RequestLocalMapSnapshot')
      })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.map !== this.props.map) {
      this.updateMap(nextProps.map)
    }
  }

  updateMap = image => {
    this.canvas.globalCompositeOperation = 'source-over'
    this.canvas.putImageData(image, 0, 0)
    this.canvas.globalCompositeOperation = 'multiply'

    this.canvas.fillStyle = this.props.color
    this.canvas.fillRect(0, 0, 1920, 1080)
  }

  componentWillUnmount() {
    this.updater.dispose()
  }

  render() {
    return (
      <div style={styles.localMap}>
        <canvas
          style={styles.canvas}
          height={1080}
          width={1920}
          ref="canvas"/>
        <PlayerArrow
          orientation={this.props.position.deg}
          color={this.props.color}
          x={0.5}
          y={0.5}/>
      </div>
    )
  }
}
