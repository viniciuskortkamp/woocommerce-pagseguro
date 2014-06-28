/* jshint node:true */
module.exports = function( grunt ) {
'use strict';

	grunt.initConfig({

		// Setting folder templates
		dirs: {
			css:    'assets/css',
			fonts:  'assets/fonts',
			images: 'assets/images',
			js:     'assets/js'
		},

		// gets the package vars
		pkg: grunt.file.readJSON( 'package.json' ),
		svn_settings: {
			path: '../../../../wp_plugins/<%= pkg.name %>',
			tag: '<%= svn_settings.path %>/tags/<%= pkg.version %>',
			trunk: '<%= svn_settings.path %>/trunk',
			exclude: [
				'.editorconfig',
				'.git/',
				'.gitignore',
				'.jshintrc',
				'node_modules/',
				'Gruntfile.js',
				'README.md',
				'package.json',
				'*.zip'
			]
		},

		// Javascript linting with jshint
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= dirs.js %>/*/*.js',
				'!<%= dirs.js %>/*/*.min.js'
			]
		},

		// Minify .js files.
		uglify: {
			options: {
				preserveComments: 'some'
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= dirs.js %>/',
					src: [
						'*.js',
						'!*.min.js'
					],
					dest: '<%= dirs.js %>/',
					ext: '.min.js'
				}]
			}
		},

		// Watch changes for assets
		watch: {
			js: {
				files: [
					'<%= dirs.js %>/*js',
					'!<%= dirs.js %>/*.min.js'
				],
				tasks: ['jshint', 'uglify']
			}
		},

		// Image optimization
		imagemin: {
			dist: {
				options: {
					optimizationLevel: 7,
					progressive: true
				},
				files: [{
					expand: true,
					cwd: './',
					src: 'screenshot-*.png',
					dest: './'
				}]
			}
		},

		// Rsync commands used to take the files to svn repository
		rsync: {
			tag: {
				src: './',
				dest: '<%= svn_settings.tag %>',
				recursive: true,
				exclude: '<%= svn_settings.exclude %>'
			},
			trunk: {
				src: './',
				dest: '<%= svn_settings.trunk %>',
				recursive: true,
				exclude: '<%= svn_settings.exclude %>'
			}
		},

		// Shell command to commit the new version of the plugin
		shell: {
			svn_add: {
				command: 'svn add --force * --auto-props --parents --depth infinity -q',
				options: {
					stdout: true,
					stderr: true,
					execOptions: {
						cwd: '<%= svn_settings.path %>'
					}
				}
			},
			svn_commit: {
				command: 'svn commit -m "updated the plugin version to <%= pkg.version %>"',
				options: {
					stdout: true,
					stderr: true,
					execOptions: {
						cwd: '<%= svn_settings.path %>'
					}
				}
			}
		}

	});

	// Load tasks
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-imagemin' );
	grunt.loadNpmTasks( 'grunt-rsync' );
	grunt.loadNpmTasks( 'grunt-shell' );

	// Register tasks
	grunt.registerTask( 'default', [
		'jshint',
		'uglify'
	]);

	// Deploy task
	grunt.registerTask( 'deploy', [
		'rsync:tag',
		'rsync:trunk',
		'shell:svn_add',
		'shell:svn_commit'
	] );
};
