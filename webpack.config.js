/*eslint-disable */
var webpack = require('webpack')
var path = require('path')
var fs = require('fs')

module.exports = {
  watch: true,
  entry: [
    './src/index.jsx'
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  target: 'node',
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
  externals: fs.readdirSync("node_modules").map(function(module) {
    return "commonjs " + module
  }),
  output: {
    path: path.join(__dirname, 'app'),
    filename: 'bundle.js'
  }
}
