/**
 * Shared build function
 */

module.exports = function (grunt, cb) {

  var webpack = require('webpack')
  var banner =
    '/**\n' +
    ' * Asta4js ' +
    ' * Released under the XXX License.\n' +
    ' */\n'

  webpack({
    entry: './src/aj-build.js',
    output: {
      path: './dist',
      filename: 'aj.js',
      library: 'Aj',
      libraryTarget: 'umd'
    },
    plugins: [
      new webpack.BannerPlugin(banner, { raw: true })
    ]
  }, cb)

}