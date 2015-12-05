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

class LocalMap extends React.Component {
  static contextTypes = {
    sendCommand: React.PropTypes.func.isRequired
  }

  constructor(props, context) {
    super(props, context)
  }

  state = {
    width: 1920,
    height: 1080
  }

  componentDidMount() {
    this.context.sendCommand('RequestLocalMapSnapshot')
    this.sub = dispatcher
      .filter(x => x && x.type === SERVER_LOCALMAP_UPDATE)
      .doOnNext(() => {
        this.context.sendCommand('RequestLocalMapSnapshot')
      })
      .map(x => parseBinaryMap(x.payload))
      .subscribe(map => {

        const {
          width,
          height,
          pixels
        } = map

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
        console.log('filled')
      })
  }

  componentWillUnmount() {
    this.sub.dispose()
  }

  render() {
    const scale = {
      x: window.innerWidth / this.state.width,
      y: window.innerHeight / this.state.height
    }

    return (
      <div style={styles.localMap}>
        <canvas
          style={Object.assign({}, styles.canvas, {
            transform: `scale(${scale.x},${scale.y})`
          })}
          height={this.state.height}
          width={this.state.width}
          ref="canvas"/>
        <PlayerArrow
          orientation={this.props.orientation || 0}
          x={0.5}
          y={0.5}/>
      </div>
    )
  }
}

// TODO: Babel 6 doesn't support decorators yet
export default withStore(dispatcher
  .reduce(Database)
  .map(x => generateTreeFromDatabase(x))
  .map(x => x && x.Map.World.Player.Rotation)
  .distinctUntilChanged(),
  'orientation')(LocalMap)
