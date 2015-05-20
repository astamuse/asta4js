/**
 * Shared build function
 */

var getLicense = function(){
  var fs = require('fs');
  var license = fs.readFileSync("./LICENSE", 'utf-8');
  var lines = license.split("\n").map(function(line){
    return " * " + line;
  }).join("\n");
  lines = "/*\n" + lines + "\n */\n";
  return lines;
}

module.exports = function (grunt, cb) {
  var license = getLicense();
  
  var webpack = require('webpack');
  var banner = license
               + "\n"
               + "\n";

  webpack({
    bail: true,
    entry: './src/aj.js',
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