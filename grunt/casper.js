/**
 * Run e2e tests with CasperJS.
 */

module.exports = function (grunt) {
  grunt.registerTask( 'casper', function (id) {
    var path = require('path')
    var done = this.async()
    var file = id ? id + '.js' : '*.js'
    grunt.log.writeln("casper test file:" + file)
    grunt.util.spawn({
      cmd: 'casperjs',
      args: ['test', './' + file],
      opts: {
        stdio: ['ignore', process.stdout, 'ignore'],
        cwd: path.resolve('test/e2e')
      }
    }, function (err, res) {
      if (err){
        grunt.log.writeln(err.description)
        grunt.log.writeln(err.stack)
        grunt.log.writeln(res.code)
        grunt.log.writeln(res.toString())
        grunt.fail.fatal(res.stdout || 'CasperJS test failed')
      }
      grunt.log.writeln(res.stdout)
      done()
    })
  })
}