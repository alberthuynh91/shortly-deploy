module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';\n',
      },
      client: {
        src: ['public/client/**/*.js'],
        dest: 'public/dist/client.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      options: {
        mangle: {
          except: ['jQuery', 'Backbone', '_', 'Handlebars']
        }
      },
      app: {
        files: {
          'public/dist/client.min.js': ['public/dist/client.js'],
        }
      },
      lib: {
        files: [{
            expand: true,
            cwd: 'public/lib',
            src: '*.js',
            dest: 'public/dist/lib'
        }]
      }
    },

    eslint: {
      target: ['public/client/**/*.js']
    },

    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'public/dist/style.min.css': ['public/style.css']
        }
      }
    },

    processhtml: {
      ejs: {
        files: {
          'views/index.ejs': ['views/index.ejs'],
          'views/layout.ejs': ['views/layout.ejs']
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      npmInstall: {
        command: 'npm install'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
      cmd: 'grunt',
      grunt: true,
      args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', ['mochaTest']);

  grunt.registerTask('build', ['npmInstall', 'eslint', 'concat', 'uglify', 'cssmin']);


  grunt.registerTask('deploy', function(n) {
    if (grunt.option('prod')) {
      grunt.task.run([ 'build', 'processhtml' ]);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });


};
