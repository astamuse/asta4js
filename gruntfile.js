//var sauceConfig = require('./grunt/sauce')


module.exports = function (grunt) {

  var targetFile = grunt.option("file") || '';

  var e2eTests = targetFile ? [targetFile] : ['test/e2e/**/*.js'];

  grunt.initConfig({

    version: grunt.file.readJSON('package.json').version,

    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true
      },
      build: {
        src: ['gruntfile.js']
      },
      src: {
        src: 'src/**/*.js'
      },
      test: {
        src: ['test/**/*.js']
      }
    },

    watch: {
      options: {
        nospawn: true
      },
      dev: {
        files: ['src/**/*.js'],
        tasks: ['dev']
      },
      test: {
        files: ['test/spec/**/*.js'],
        tasks: ['build-test']
      }
    },

    karma: {
      options: {
        frameworks: ['jasmine', 'commonjs'],
        files: [
          'lib/**/*.js',
          'src/**/*.js',
          'test/spec/**/*.js'
        ],
        preprocessors: {
          'lib/**/*.js': ['commonjs'],
          'src/**/*.js': ['commonjs'],
          'test/spec/**/*.js': ['commonjs']
        },
        singleRun: true
      },
      browsers: {
        options: {
          browsers: ['Chrome', 'Firefox'],
          reporters: ['progress']
        }
      },
      debug: {
        browsers: ['Chrome'],
        reporters: ['progress'],
        singleRun: false
      },
      coverage: {
        options: {
          browsers: ['PhantomJS'],
          reporters: ['progress', 'coverage'],
          preprocessors: {
            'lib/**/*.js': ['commonjs'],
            'src/**/*.js': ['commonjs', 'coverage'],
            'test/spec/**/*.js': ['commonjs']
          },
          coverageReporter: {
            reporters: [
              { type: 'lcov' },
              { type: 'text-summary' }
            ]
          }
        }
      }
    },
    
    /*
    casper : {
     test : {
        options : {
          test : true,
          engine : 'phantomjs',
          parallel : false
        },
        files : {
          "xunit/casper-results.xml": ['test/e2e/a.js'] 
        }
      }
    },
    */
    /*
    casperjs: {
      options: {
        engine : 'phantomjs',
        async: {
          parallel: false
        }
      },
      files: ['test/e2e/a.js']
    },
    */

    coveralls: {
      options: {
        coverage_dir: 'coverage/',
        force: true
      }
    },
    /*
    dalek: {
      options:{
        browser: ['chrome']
      },
      dist: {
        src: ['test/e2e/d.js']
      }
    },
    */
    webdriver: {
      chrome: {
          tests: e2eTests,
          options: {
              // overwrite default settings
              desiredCapabilities: {
                  browserName: 'chrome'
              }
          }
      },
      firefox: {
          tests: e2eTests,
          options: {
              // overwrite default settings
              desiredCapabilities: {
                  browserName: 'firefox'
              }
          }
      },
      ie: {
          tests: e2eTests,
          options: {
              // overwrite default settings
              desiredCapabilities: {
                  browserName: 'ie'
              }
          }
      },
      /*
      phantomjs: {
          tests: e2eTests,
          options: {
              // overwrite default settings
              desiredCapabilities: {
                  browserName: 'phantomjs'
              }
          }
      }
      */
      // ...
    },
    connect: {
      server: {
        options: {
          port: 9001,
          base: '.'
        }
      }
    }

  })
  
  // load npm tasks
  //grunt.loadNpmTasks('grunt-casper')
  //grunt.loadNpmTasks('grunt-dalek')
  
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-karma')
  grunt.loadNpmTasks('grunt-karma-coveralls')
  
  grunt.loadNpmTasks('grunt-webdriver')
  grunt.loadNpmTasks('grunt-contrib-connect');

  // load custom tasks
  
  grunt.file.recurse('grunt', function (path) {
    require('./' + path)(grunt)
  })
  

  grunt.registerTask('unit-debug', ['karma:debug'])
  grunt.registerTask('unit', ['karma:browsers'])
  grunt.registerTask('cover', ['karma:coverage'])
  //grunt.registerTask('casperx', ['casper:test'])

  grunt.registerTask('test', ['unit', 'wtest'])
  grunt.registerTask('wtest',  ['dev', 'connect', 'webdriver'])
  grunt.registerTask('wtestc', ['dev', 'connect', 'webdriver:chrome'])
  grunt.registerTask('wtestf', ['dev', 'connect', 'webdriver:firefox'])
  grunt.registerTask('wtesti', ['dev', 'connect', 'webdriver:ie'])
  //grunt.registerTask('sauce', ['karma:sauce1', 'karma:sauce2', 'karma:sauce3'])
  //grunt.registerTask('ci', ['jshint', 'cover', 'coveralls', 'build', 'casper', 'sauce'])
  //grunt.registerTask('default', ['jshint', 'build', 'test'])

}