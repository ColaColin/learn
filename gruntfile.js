var properties = require('./src/js/properties.js');
module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-cache-bust');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-mkdir');  
  grunt.loadNpmTasks('grunt-contrib-concat');
  
  var productionBuild = !!(grunt.cli.tasks.length && grunt.cli.tasks[0] === 'build');

  grunt.initConfig(
    { pkg: grunt.file.readJSON('package.json')

    , properties: properties

    , project:
      { src: 'src/js'
      , js: '<%= project.src %>/{,*/}*.js'
      , dest: 'build/js'
      , bundle: 'build/js/app.min.js'
      , port: properties.port
      , banner:
        '/*\n' +
        ' * <%= properties.title %>\n' +
        ' * <%= pkg.description %>\n' +
        ' *\n' +
        ' * @author <%= pkg.author %>\n' +
        ' * @version <%= pkg.version %>\n' +
        ' * @copyright <%= pkg.author %>\n' +
        ' * @license <%= pkg.license %> licensed\n' +
        ' */\n'
      }
    , concat: {
		packResources: {
			options: {
				process: function(src, filepath) {
					var keyJson = JSON.stringify(filepath.replace("src/resources/", ""));;
					return "preloaded.preloadData("+keyJson+", "+JSON.stringify(src)+");";
				},
			},
			src: ["src/resources/**"],
			dest: 'build/resources.js',
			nonull: true,
		},
		includeResources: {
			options: {
				process: function(src, filepath) {
					return src.replace("//RES_HERE", grunt.file.read('build/resources.js'));
				},
			},
			src: ["src/js/Preloaded_template.js"],
			dest: "Preloaded.js",
			nonull: true,
		},
    }
    , connect:
      { dev:
        { options:
          { port: '<%= project.port %>'
          , base: './build'
          }
        }
      }
    , watch:
      { options:
        { livereload: productionBuild ? false : properties.liveReloadPort
        }
      , js:
        { files: 'src/**'
        , tasks: ['update']
        }
      }

    , browserify:
      { app:
        { src: ['<%= project.src %>/app.js']
        , dest: '<%= project.bundle %>'
        , options:
          { transform: ['browserify-shim']
          , watch: true
          , browserifyOptions:
            { debug: !productionBuild
            }
          }
        }
      }

    , open:
      { server:
        { path: 'http://localhost:<%= project.port %>'
        }
      }

    , cacheBust:
      { options:
        { assets: ['images/**', 'js/**', 'css/**', 'html/**']
        , baseDir: './build/'
        , deleteOriginals: true
        , length: 9
        }
      , files: {
          src: ['./build/js/app.min.*', './build/index.html']
        }
      }
    , clean: {
        "all": ['./build/'],
        "tmp": ['Preloaded.js', 'build/resources.js'],
     }
    , mkdir: 
      {
        images: {
        	options: {
        		create: ['build/images']
        	}
        }
      }
    , copy:
      { html:
        { files:
          [ { expand: true, cwd: 'src/', src: ['*.html'], dest: 'build/' }
          ]
        },
        images: { files:
            [ { expand: true, cwd: 'src/images/', src: ['*.png', '*.xml', '*.ico'], dest: 'build/images' }
            ]
          },
          css: { files:
              [ { expand: true, cwd: 'src/css/', src: ['*.css'], dest: 'build/css' }
              ]
            },
      }
    , uglify:
      { options:
        { banner: '<%= project.banner %>'
        }
      , dist:
        { files:
          { '<%= project.bundle %>': '<%= project.bundle %>'
          }
        }
      }
    }
  );

  grunt.registerTask('default',
    [ 'clean:all'
    , 'concat:packResources'
    , 'concat:includeResources'
    , 'copy:html'
    , 'copy:images'
    , 'copy:css'
    , 'browserify'
    , 'clean:tmp'
    , 'connect'
    , 'watch'
    ]
  );
  
  grunt.registerTask('update', ['clean:all',
                                'concat:packResources',
                                'concat:includeResources',
                                'copy:html',
                                'copy:images',
                                'copy:css',
                                'browserify',
                                'clean:tmp']);
  
  grunt.registerTask('pack', 
		  [ 'clean:all'
		    , 'concat:packResources'
		    , 'concat:includeResources'
		    , 'copy:html'
		    , 'copy:images'
		    , 'copy:css'
		    , 'browserify'
		    , 'clean:tmp'
		    , 'uglify'
		    ]);
};
