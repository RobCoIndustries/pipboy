/*eslint-disable */
var webpack = require('webpack')
var path = require('path')

module.exports = {
  watch: true,
  entry: [
    './src/index.jsx'
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'app'),
    filename: 'bundle.js'
  }
}
