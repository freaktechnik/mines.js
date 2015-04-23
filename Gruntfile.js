module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        distdir: 'dist',
        localedir: 'locales',
        pkg: grunt.file.readJSON('package.json'),
        banner:
            '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
            ' * This Source Code Form is subject to the terms of the Mozilla Public License,\n' +
            ' * v. 2.0. If a copy of the MPL was not distributed with this file, You can\n' +
            ' * obtain one at http://mozilla.org/MPL/2.0/.\n */\n',
        locales: function() {
            return grunt.file.expand(grunt.config('localedir')+"/*").join(",").replace(new RegExp(grunt.config('localedir')+"/", "g"), "");
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            build: {
                files: [
                    {
                        '<%= distdir %>/mines.min.js': 'src/*.js',
                    },
                    {
                        expand: true,
                        cwd: 'assets/scripts',
                        src: '**/*.js',
                        dest: '<%= distdir %>/scripts',
                        ext: '.min.js'
                    }
                ]
            }
        },
        cssmin: {
            minify: {
                files: [{
                    expand: true,
                    cwd: 'assets/styles',
                    src: ['*.css'],
                    dest: '<%= distdir %>/styles/',
                    ext: '.css'
                }]
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        jshint: {
            test: {
                options: {
                    esnext: true
                },
                files: {
                    src: ['Gruntfile.js', 'assets/scripts/**/*.js', 'src/**/*.js', 'test/**/*.js']
                }
            }
        },
        bower: {
            build: {
                dest: '<%= distdir %>/vendor/',
                options: {
                    expand: true,
                    packageSpecific: {
                        'gaia-fonts': {
                            files: [
                                'fonts/**',
                                'style.css'
                            ]
                        }
                    }
                }
            }
        },
        concat: {
            dev: {
                options: {
                    banner: '<%= banner %>'
                },
                files: [{
                    '<%= distdir %>/mines.min.js': 'src/*.js'
                }]
            }
        },
        copy: {
            dev: {
                files: [
                    {
                        expand: true,
                        cwd: 'assets/scripts',
                        src: '**/*.js',
                        dest: '<%= distdir %>/scripts',
                        ext: '.min.js'
                    },
                    {
                        expand: true,
                        cwd: 'assets/styles',
                        src: ['*.css'],
                        dest: '<%= distdir %>/styles/',
                        ext: '.css'
                    }
                ]
            },
            html: {
                options: {
                    process: function(file) {
                        return file.replace("{{locales}}", grunt.config('locales'));
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: 'assets',
                        src: ['*.html'],
                        dest: '<%= distdir %>'
                    }
                ]
            },
            build: {
               files: [
                    {
                        expand: true,
                        cwd: '<%= localedir %>',
                        src: ['**'],
                        dest: '<%= distdir %>/<%= localedir %>'
                    },
                    {
                        expand: true,
                        cwd: 'assets/font',
                        src: ['**'],
                        dest: '<%= distdir %>/font'
                    },
                    {
                        expand: true,
                        cwd: 'assets/images',
                        src: ['**/*.png', '**/*.svg', '**/*.jpg'],
                        dest: '<%= distdir %>/images'
                    }
                ]
            },
            manifest: {
                options: {
                    process: function(file) {
                        var json = JSON.parse(file);
                        json.version = grunt.config('pkg.version');
                        json.appcache_path = "/manifest.appcache";
                        json.name = grunt.config('pkg.name');
                        json.description = grunt.config('pkg.description');
                        json.developer = {
                            name: grunt.config('pkg.author.name'),
                            url: grunt.config('pkg.author.url')
                        };
                        return JSON.stringify(json);
                    }
                },
                files: { '<%= distdir %>/manifest.webapp': 'manifest.webapp' }
            },
            pkgmanifest: {
                options: {
                    process: function(file) {
                        var json = JSON.parse(file);
                        json.version = grunt.config('pkg.version');
                        json.name = grunt.config('pkg.name');
                        json.description = grunt.config('pkg.description');
                        json.developer = {
                            name: grunt.config('pkg.author.name'),
                            url: grunt.config('pkg.author.url')
                        };
                        return JSON.stringify(json);
                    }
                },
                files: { '<%= distdir %>/manifest.webapp': 'manifest.webapp' }
            }
        },
        transifex: {
            'mines': {
                options: {
                    targetDir: '<%= localedir %>',
                    resources: ['app_properties'],
                    filename: '_lang_/app.properties',
                    templateFn: function(strings) {
                        return strings.sort(function(a, b) {
                            return a.key.localeCompare(b.key);
                        }).reduce(function(p, string) {
                            return p + string.key + "=" + string.translation + "\n";
                        }, "");
                    }
                }
            }
        },
        clean: {
            main: [ '<%= distdir %>', '*.zip' ],
            test: 'test/dist'
        },
        es6transpiler: {
            bowerlibs: {
                options: {
                    globals: {
                        "Event": true,
                        "define": true
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: "<%= distdir %>/vendor",
                        src: ['gaia-*/*.js'],
                        dest: '<%= distdir %>/vendor'
                    }
                ]
            },
            test: {
                options: {
                    globals: {
                        "Event": true,
                        "Math": true,
                        "CustomEvent": true,
                        "Date": true,
                        "IDBKeyRange": true
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: ["**/*.js"],
                        dest: "test/dist"
                    }
                ]
            }
        },
        watch: {
            options: {
                tasks: 'dev'
            },
            main: '**'
        },
        compress: {
            main: {
                options: {
                    archive: '<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                expand: true,
                cwd: '<%= distdir %>/',
                src: ['**/*'],
                dest: '/'
            },
            travis: {
                options: {
                    archive: '<%= pkg.name %>.zip'
                },
                expand: true,
                cwd: '<%= distdir %>/',
                src: ['**/*'],
                dest: '/'
            }
        },
        validatewebapp: {
            options: {
                listed: true,
                packaged: true
            },
            main: { src: '<%= distdir %>/manifest.webapp' }
        },
        accessibility: {
            options: {
                reportLevels: {
                    notice: false,
                    warning: true,
                    error: true
                },
                force: false,
                ignore: [
                    'WCAG2A.Principle1.Guideline1_3.1_3_1.H44.NotFormControl',
                    'WCAG2A.Principle1.Guideline1_3.1_3_1.H85.2'
                ]
            },
            main: {
                src: 'assets/*.html'
            }
        },
        appcache: {
            options: {
                basePath: '<%= distdir %>'
            },
            web: {
                dest: '<%= distdir %>/manifest.appcache',
                cache: '<%= distdir %>/**/*'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-es6-transpiler');
    grunt.loadNpmTasks('grunt-bower');
    grunt.loadNpmTasks('grunt-transifex');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-validate-webapp');
    grunt.loadNpmTasks('grunt-accessibility');
    grunt.loadNpmTasks('grunt-appcache');

    // Default task(s).
    grunt.registerTask('default', ['transifex', 'uglify', 'bower', 'cssmin', 'copy:html', 'copy:build', 'copy:manifest', 'es6transpiler:bowerlibs', 'appcache']);

    grunt.registerTask('package', ['transifex', 'uglify', 'bower', 'cssmin', 'copy:html', 'copy:build', 'copy:pkgmanifest', 'es6transpiler:bowerlibs', 'compress:main']);
    grunt.registerTask('travis', ['package', 'compress:travis']);

    grunt.registerTask('dev', ['jshint', 'bower', 'concat:dev', 'copy:dev', 'copy:html', 'copy:build', 'copy:manifest', 'es6transpiler:bowerlibs', 'appcache']);

    grunt.registerTask('test', ['package', 'jshint', 'validatewebapp', 'accessibility', 'es6transpiler:test', 'qunit', 'clean']);
};
