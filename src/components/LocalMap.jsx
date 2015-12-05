import React from 'react'

import {
  Observable
} from 'rx'

import {
  withStore
} from 'fluorine-lib'

import {
  decoding
} from 'pipboylib'

const {
  parseBinaryMap,
  generateTreeFromDatabase
} = decoding

import {
  SERVER_LOCALMAP_UPDATE
} from '../constants/server_types'

import PlayerArrow from './PlayerArrow'
import dispatcher from '../dispatcher'
import Database from '../stores/Database'

const styles = {
  localMap: {
    display: 'block',
    height: '100%',
    width: '100%'
  },
  canvas: {
    background: '#000'
  }
}

@withStore(dispatcher
  .filter(x => x.type === SERVER_LOCALMAP_UPDATE)
  .map(x => parseBinaryMap(x.payload)),
  'map')
@withStore(dispatcher
  .reduce(Database)
  .map(x => generateTreeFromDatabase(x))
  .map(x => x.Map.World.Player.Rotation)
  .distinctUntilChanged(),
  'orientation')
@withStore(Observable
  .fromEvent(window, 'resize')
  .merge(Observable.just())
  .map(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  })),
  'viewport')
export default class LocalMap extends React.Component {
  componentWillReceiveProps(newProps) {
    if (newProps.map !== this.props.map && this.refs.canvas) {
      const {
        width,
        height,
        pixels
      } = newProps.map

      const context = this.refs.canvas.getContext('2d')
      const image = context.createImageData(width, height)
      const data = image.data

      for (let i = 0; i < pixels.length; i++) {
        const val = pixels[i]
        const offset = i * 4
        data[offset] = val
        data[offset + 1] = val
        data[offset + 2] = val
        data[offset + 3] = 255
      }

      this.setState({
        width: width,
        height: height
      })

      context.globalCompositeOperation = 'source-over'
      context.putImageData(image, 0, 0)
      context.globalCompositeOperation = 'multiply'
      context.fillStyle = 'rgb(25, 255, 25)'
      context.fillRect(0, 0, width, height)
    }
  }

  render() {
    const scale = {
      x: this.props.viewport.width / this.state.width,
      y: this.props.viewport.height / this.state.height
    }

    return (
      <div style={styles.localMap}>
        <canvas
          styles={[
            styles.canvas, {
              transform: `scale(${scale.x},${scale.y})`
            }
          ]}
          height={this.state.height}
          width={this.state.width}
          ref="canvas"/>
        <PlayerArrow
          orientation={this.props.orientation}
          x={0.5}
          y={0.5}/>
      </div>
    )
  }
}
