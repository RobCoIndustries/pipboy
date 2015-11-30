/*eslint-disable */
var gulp = require('gulp')
var gutil = require('gulp-util')

var webpack = require('webpack')
var webpackConfig = require('./webpack.config')

gulp.task('webpack', function() {
  webpack(webpackConfig, function(err, stats) {
    gutil.log('[webpack]', stats.toString({
      errorDetails: true,
      colors: true
    }))
  })
})

gulp.task('default', ['webpack'])
