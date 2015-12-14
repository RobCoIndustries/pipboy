import React from 'react';
import { withStore } from 'fluorine-lib';

import {
  decoding,
} from 'pipboylib';

import Database from '../stores/Database';
import dispatcher from '../dispatcher';

const { generateTreeFromDatabase } = decoding;

@withStore(dispatcher
  .reduce(Database)
  .map(x => generateTreeFromDatabase(x))
  .filter(x => x && x.Status)
  .map(x => x.Status.EffectColor)
  .map(effectColor => {
    const effectColors = effectColor.map(x => Math.round(x * 255));
    const effect = {
      red: effectColors[0],
      green: effectColors[1],
      blue: effectColors[2],
    };
    return `rgb(${effect.red},${effect.green},${effect.blue})`;
  })
  .distinctUntilChanged(),
  'color')
export default class About extends React.Component {
  static displayName = 'About';

  static propTypes = {
    color: React.PropTypes.string,
  };

  render() {
    const styles = {
      about: {
        color: this.props.color,
      },
    };

    return (
      <div style={styles.about}>
        <h1>RobCo Industries PipBoy</h1>
        <p>Fan built precision electronics</p>
      </div>
    );
  }
}
