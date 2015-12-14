import React from 'react';

import { withStore } from 'fluorine-lib';

import { decoding } from 'pipboylib';
const { parseBinaryMap, generateTreeFromDatabase } = decoding;

import {
  SERVER_LOCALMAP_UPDATE,
} from '../constants/server_types';

import PlayerArrow from './PlayerArrow';
import dispatcher from '../dispatcher';
import Database from '../stores/Database';

const styles = {
  localMap: {
    display: 'block',
    position: 'relative',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  canvas: {
    background: '#000',
    height: '100%',
    width: '100%',
  },
};

@withStore(dispatcher
  .reduce(Database)
  .map(x => generateTreeFromDatabase(x))
  .filter(x => x && x.Status)
  .map(x => x.Status.EffectColor)
  .map(x => {
    const color = x.map(v => Math.round(v * 255));
    return `rgb(${color[0]},${color[1]},${color[2]})`;
  })
  .distinctUntilChanged(),
  'color')
@withStore(dispatcher
  .reduce(Database)
  .map(x => generateTreeFromDatabase(x))
  .map(x => x && x.Map.World.Player.Rotation)
  .distinctUntilChanged(),
  'orientation')
@withStore(dispatcher
  .filter(x => x && x.type === SERVER_LOCALMAP_UPDATE)
  .map(x => parseBinaryMap(x.payload))
  .filter(map => {
    return !map.pixels.equals(new Buffer(map.pixels.length));
  })
  .distinctUntilChanged(),
  'map')
export default class LocalMap extends React.Component {
  static displayName = 'Local Map';

  static propTypes = {
    color: React.PropTypes.string,
    map: React.PropTypes.object,
    orientation: React.PropTypes.number,
  }

  static contextTypes = {
    sendCommand: React.PropTypes.func.isRequired,
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      width: props.map.width,
      height: props.map.height,
    };
  }

  componentDidMount() {
    this.updateMap(this.props.map, this.props.color);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.map !== this.props.map) {
      this.updateMap(nextProps.map, this.props.color);
    }
  }

  updateMap = (map, color) => {
    // Get next LocalMap
    this.context.sendCommand('RequestLocalMapSnapshot');

    const {
      width,
      height,
      pixels,
    } = map;

    const context = this.refs.canvas.getContext('2d');
    const image = context.createImageData(width, height);
    const data = image.data;

    for (let i = 0; i < pixels.length; i++) {
      const val = pixels[i];
      const offset = i * 4;
      data[offset] = val;
      data[offset + 1] = val;
      data[offset + 2] = val;
      data[offset + 3] = 255;
    }

    context.globalCompositeOperation = 'source-over';
    context.putImageData(image, 0, 0);
    context.globalCompositeOperation = 'multiply';

    context.fillStyle = color;
    context.fillRect(0, 0, width, height);
  }

  render() {
    return (
      <div style={styles.localMap}>
        <canvas
          style={styles.canvas}
          height={this.state.height}
          width={this.state.width}
          ref='canvas'/>
        <PlayerArrow
          orientation={this.props.orientation || 0}
          x={0.5}
          y={0.5}
          color={this.props.color}/>
      </div>
    );
  }
}
