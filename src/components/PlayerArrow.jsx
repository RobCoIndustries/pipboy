import React from 'react'

const styles = {
  arrow: {
    position: 'fixed',
    display: 'block',
    width: 0,
    height: 0,
    borderLeft: '15px solid transparent',
    borderRight: '15px solid transparent',
    borderBottom: '36px solid #000',
    marginLeft: -15,
    marginTop: -18
  },
  inner: {
    position: 'absolute',
    top: 4,
    left: -12,
    display: 'block',
    width: 0,
    height: 0,
    borderLeft: '12px solid transparent',
    borderRight: '12px solid transparent',
    borderBottom: '30px solid #4aff4a'
  }
}

export default class PlayerArrow extends React.Component {
  static propTypes = {
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    orientation: React.PropTypes.number
  }

  static defaultProps = {
    x: 0,
    y: 0,
    orientation: 0
  }

  render() {
    return (
      <div style={Object.assign({}, styles.arrow, {
        left: `${this.props.x * 100}%`,
        top: `${this.props.y * 100}%`,
        transform: `rotate(${this.props.orientation}deg)`
      })}>
        <div style={styles.inner}/>
      </div>
    )
  }
}
