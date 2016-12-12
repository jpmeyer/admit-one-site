'use strict';

var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var serveStatic = require('serve-static');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var project = {
    src: 'app',
    dist: 'dist',
    temp: '.tmp'
  };

  grunt.initConfig({
    project: project,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= project.src %>/scripts/**.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/**.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      sass: {
        files: ['<%= project.src %>/styles/**.{scss,sass}'],
        tasks: ['sass', 'postcss:serve']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      modernizr: {
        files: ['<%= project.temp %>/modernizr.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= project.src %>/**.html',
          '<%= project.temp %>/**.css',
          '<%= project.src %>/images/**.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost', // Change this to '0.0.0.0' to access the server from outside.
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              serveStatic(project.temp),
              connect().use(
                  '/bower_components',
                  serveStatic('./bower_components')
              ),
              connect().use(
                  '/fonts',
                  serveStatic('./bower_components/bootstrap-sass-official/assets/fonts/bootstrap')
              ),
              connect().use(
                  '/fonts',
                  serveStatic('./bower_components/font-awesome/fonts')
              ),
              serveStatic(project.src)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          livereload: false,
          middleware: function(connect) {
            return [
              serveStatic(project.dist),
              connect().use('/config.json', serveStatic(project.src + '/config.json'))
            ];
          }
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= project.src %>/**.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/**.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= project.temp %>',
            '<%= project.dist %>'
          ]
        }]
      },
      server: '<%= project.temp %>',
      package: 'admit-one-site-*.tgz'
    },

    postcss: {
      serve: {
        options: {
          map: true,
          processors: [
            autoprefixer({
              browsers: ['last 2 versions']
            })
          ]
        },
        src: '<%= project.temp %>/**.css'
      },
      dist: {
        options: {
          map: false,
          processors: [
            autoprefixer({
              browsers: ['last 2 versions']
            }),
            cssnano()
          ]
        },
        src: '<%= project.dist %>/**.css'
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        sourceMap: true
      },
      app: {
        files: [{
          expand: true,
          cwd: '<%= project.src %>/styles',
          src: ['*.{scss,sass}'],
          dest: '<%= project.temp %>',
          ext: '.css'
        }]
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= project.dist %>/platform.{js,css}'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= project.src %>/index.html',
      options: {
        dest: '<%= project.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglify']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: '<%= project.dist %>/index.html'
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= project.dist %>',
          src: '**.{png,jpg,jpeg,gif}',
          dest: '<%= project.dist %>'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= project.src %>',
          src: '**.svg',
          dest: '<%= project.dist %>'
        }]
      }
    },

    ngtemplates: {
      app: {
        cwd: '<%= project.temp %>/templates',
        src: ['templates/*.html','views/*.html'],
        dest: '<%= project.temp %>/concat/platform.js',
        options:  {
          append: true,
          module: 'admit-one-site',
          htmlmin: '<%= htmlmin.templates %>',
          usemin: 'platform.js'
        }
      }
    },

    htmlmin: {
      options: {
        collapseWhitespace: true,
        conservativeCollapse: true,
        collapseBooleanAttributes: true,
        removeCommentsFromCDATA: true,
        removeOptionalTags: true
      },
      templates: {
        files: [{
          expand: true,
          cwd: '<%= project.src %>',
          src: ['templates/**.html', 'views/**.html'],
          dest: '<%= project.temp %>/templates'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= project.dist %>',
          src: ['*.html'],
          dest: '<%= project.dist %>'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= project.src %>',
          dest: '<%= project.dist %>',
          src: [
            '**.{ico,png,txt,jpg,jpeg}',
            'robots.txt',
            '*.html'
          ]
        }, {
          expand: true,
          cwd: '<%= project.temp %>',
          dest: '<%= project.dist %>',
          src: 'platform.css'
        }, {
          expand: true,
          cwd: '<%= project.temp %>/concat',
          dest: '<%= project.dist %>',
          src: 'platform.js'
        }, {
          expand: true,
          cwd: 'bower_components/font-awesome/fonts',
          src: '**/*',
          dest: '<%= project.dist %>/fonts/'
        }, {
          expand: true,
          cwd: 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap',
          src: '**/*',
          dest: '<%= project.dist %>/fonts/'
        }]
      },
      config: {
        expand: true,
        cwd: '<%= project.src %>',
        dest: '<%= project.dist %>',
        src: 'config.json'
      }
    },

    modernizr: {
      build: {
        cache: true,
        crawl: false,
        customTests: [],
        dest: '<%= project.temp %>/modernizr.js',
        tests: [ 'backgroundcliptext' ],
        options: [ 'setClasses' ],
        uglify: false
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      minify: [
        'postcss:dist',
        'imagemin:dist',
        'svgmin:dist'
      ]
    },

    maven: {
      options: {
        groupId: 'com.patientping.hiring',
        artifactId: 'admit-one-site',
        packaging: 'tgz'
      },
      release: {
        options: {
          url: 'https://nexus.local/content/repositories/releases/',
          repositoryId: 'admit-one-releases'
        },
        files: [{expand: true, cwd: 'dist/', src: ['**'], dest: ''}]
      },
      deploy: {
        options: {
          url: 'https://nexus.local/content/repositories/snapshots/',
          repositoryId: 'admit-one-snapshots'
        },
        files: [{expand: true, cwd: 'dist/', src: ['**'], dest: ''}]
      },
      install: {
        files: [{expand: true, cwd: 'dist/', src: ['**'], dest: ''}]
      },
      package: {
        files: [{expand: true, cwd: 'dist/', src: ['**'], dest: ''}]
      }
    }
  });

  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'copy:config', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'modernizr',
      'sass',
      'postcss:serve',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'modernizr',
    'sass',
    'useminPrepare',
    'concat:generated',
    'htmlmin:templates',
    'ngtemplates',
    'copy:dist',
    'uglify:generated',
    'concurrent:minify',
    'filerev',
    'usemin',
    'htmlmin:dist'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'build'
  ]);

  grunt.registerTask('preDeploy', ['clean:package', 'build']);
  grunt.registerTask('deploy', ['preDeploy', 'maven:deploy']);
  grunt.registerTask('release', ['preDeploy', 'maven:release']);
  grunt.registerTask('install', ['preDeploy', 'maven:install']);
};
