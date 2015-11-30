/*eslint-disable */
var webpack = require('webpack')
var path = require('path')

module.exports = {
  watch: true,
  entry: [
    'src/index.jsx'
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel']
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'app'),
    filename: 'bundle.js'
  }
}
