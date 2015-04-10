/**
 * Shared build function
 */

module.exports = function (grunt, cb) {
  
  //console.log("here", process.cwd())
  
  //console.log("aaa", __dirname)

  var webpack = require('webpack')
  var banner =
    '/**\n' +
    ' * Asta4js ' +
    ' * Released under the XXX License.\n' +
    ' */\n'

  webpack({
    bail: true,
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