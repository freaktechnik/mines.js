var deploySim = require('fxos-deploy');
var connectSim = require('fxos-connect');

module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        distdir: 'dist',
        localedir: 'locales',
        pkg: grunt.file.readJSON('package.json'),
        mpAPICreds: grunt.file.readJSON('.marketplacerc'),
        banner:
            '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
            ' * This Source Code Form is subject to the terms of the Mozilla Public License,\n' +
            ' * v. 2.0. If a copy of the MPL was not distributed with this file, You can\n' +
            ' * obtain one at http://mozilla.org/MPL/2.0/.\n */\n',
        locales: "<%= grunt.file.expand(grunt.config('localedir')+'/*').join(',').replace(new RegExp(grunt.config('localedir')+'/','g'), '') %>",
        iconSizes: "<%= JSON.stringify(grunt.file.expand('assets/images/icon-*.png').map(function(filename) {return filename.match(/assets\\/images\\/icon-([0-9]+).png/)[1];})) %>",
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
            build: {
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
            test: ['test/**/*.html']
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
                    ignorePackages: ['WeakMap', 'MutationObserver', 'es6-collections'],
                    packageSpecific: {
                        'gaia-fonts': {
                            files: [
                                'fonts/**',
                                'style.css'
                            ]
                        },
                        'webcomponentsjs': {
                            files: [ 'webcomponents.min.js' ]
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
            }
        },
        transifex: {
            mines_properties: {
                options: {
                    targetDir: '<%= localedir %>',
                    project: 'mines',
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
            },
            mines_json: {
                options: {
                    targetDir: '<%= localedir %>',
                    resources: ['manifest_json'],
                    filename: '_lang_/manifest.json',
                    project: 'mines',
                    mode: "file"
                }
            }
        },
        clean: {
            build: [ '<%= distdir %>', '*.zip' ],
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
                        "IDBKeyRange": true,
                        "unescape": true,
                        "Intl": true
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: ["**/*.js"],
                        dest: "test/dist"
                    },
                    {
                        expand: true,
                        cwd: "assets/scripts",
                        src: ["l10n.js"],
                        dest: "test/dist"
                    }
                ]
            }
        },
        watch: {
            options: {
                interrupt: true,
                debounceDelay: 1000,
                atBegin: true
            },
            web: {
                options: {
                    //livereload: true
                },
                files: ['assets/**/*', 'src/*', 'manifest.webapp', 'locales/en/*', '!**/*~'],
                tasks: 'dev'
            },
            packaged: {
                files: ['assets/**/*', 'src/*', 'manifest.webapp', 'locales/en/*', '!**/*~'],
                tasks: 'launch:simulator'
            }
        },
        compress: {
            build: {
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
        },
        webapp: {
            options: {
                localeDir: '<%= localedir %>',
                icons: 'assets/images/icon-*.png',
                iconsTarget: '/images/icon-{size}.png'
            },
            web: {
                options: {
                    target: 'web'
                },
                files: [{ '<%= distdir %>/manifest.webapp': 'manifest.webapp' }]
            },
            packaged: {
                options: {
                    target: 'packaged'
                },
                files: [{ '<%= distdir %>/manifest.webapp': 'manifest.webapp' }]
            }
        },
        'ftp-deploy': {
            production: {
                auth: {
                    host: "humanoids.be",
                    authKey: "hbp"
                },
                src: '<%= distdir %>',
                dest: '/public_html/mines'
            },
            stage: {
                auth: {
                    host: "humanoids.be",
                    authKey: "hbp"
                },
                src: '<%= distdir %>',
                dest: 'public_html/lab/mines.js'
            }
        },
        ffospush: {
            launch: {
                appId: '<%= pkg.name %>',
                zip: '<%= pkg.name %>-<%= pkg.version %>.zip'
            }
        },
        marketplace: {
            options: {
                consumerKey: '<%= mpAPICreds.consumerKey %>',
                consumerSecret: '<%= mpAPICreds.consumerSecret %>'
            },
            packaged: {
                options: {
                    target: "packaged"
                },
                files: [{
                    src: ['<%= pkg.name %>-<%= pkg.version %>.zip']
                }]
            },
            web: {
                options: {
                    target: "manifest"
                },
                files: [{
                    src: ['<%= distdir %>/manifest.webapp']
                }]
            }
        },
        preprocess: {
            options: {
                context: {
                    LOCALES: '<%= locales %>',
                    ICON_SIZES: '<%= iconSizes %>'
                },
                srcDir: 'assets/include'
            },
            html: {
                expand: true,
                cwd: 'assets',
                src: ['*.html'],
                dest: '<%= distdir %>'
            },
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
    grunt.loadNpmTasks('grunt-webapp');
    grunt.loadNpmTasks('grunt-ftp-deploy');
    grunt.loadNpmTasks('grunt-firefoxos');
    grunt.loadNpmTasks('grunt-marketplace');
    grunt.loadNpmTasks('grunt-preprocess');

    // Default task(s).
    grunt.registerTask('default', ['build:web']);

    grunt.registerTask('build', 'Build the webapp for the web or as a package (use :web or :packaged)', function(env) {
        env = env || 'web';
        grunt.task.run('transifex');

        grunt.task.run('uglify');
        grunt.task.run('bower');
        grunt.task.run('cssmin');
        grunt.task.run('preprocess:html');
        grunt.task.run('copy:build');
        grunt.task.run('webapp:'+env);
        grunt.task.run('es6transpiler:bowerlibs');

        if(env == 'packaged') {
            grunt.task.run('compress:build');
        }
        else {
            grunt.task.run('appcache');
        }
    });

    grunt.registerTask('travis', ['build:packaged', 'compress:travis']);

    grunt.registerTask('dev', 'Build an unminified version of the app (use :web or :packaged)', function(env) {
        env = env || 'web';

        grunt.task.run('bower');
        grunt.task.run('concat:dev');
        grunt.task.run('copy:dev');
        grunt.task.run('preprocess:html');
        grunt.task.run('copy:build');
        grunt.task.run('webapp:'+env);
        grunt.task.run('es6transpiler:bowerlibs');
        if(env == 'packaged') {
            grunt.task.run('compress:build');
        }
        else {
            grunt.task.run('appcache');
        }
    });

    grunt.registerTask('test', 'Run tests and validations', ['webapp:packaged', 'copy:build', 'jshint', 'validatewebapp', 'accessibility', 'es6transpiler:test', 'qunit', 'clean']);

    grunt.registerTask('deploy', 'Deoply the app, targets are :web or :packaged', function(env) {
        env = env || 'web';

        grunt.task.run('build:'+env);

        if(env == 'packaged') {
            grunt.task.run('marketplace:packaged');
        }
        else {
            grunt.task.run('ftp-deploy:production');
        }
    });

    grunt.registerTask('stage', 'Publish the app to staging with unminified sources (only :web for now)', function(env) {
        env = env || 'web';

        grunt.task.run('transifex');
        grunt.task.run('dev:'+env);

        if(env == 'web') {
            grunt.task.run('ftp-deploy:stage');
        }
        else {
            grunt.fail.warn("Can't deploy anywhere else than web.");
        }
    });

    grunt.registerTask('simulator', function(version) {
        var done = this.async();
        var opts = {
            connect: true
        };

        if(version && version != "undefined") {
            opts.release = [version];
        }

        connectSim(opts).then(function(sim) {
            return deploySim({
                manifestURL: 'dist/manifest.webapp',
                zip: grunt.config('pkg.name')+"-"+grunt.config('pkg.version')+".zip",
                client: sim.client
            }).then(function(appId) {
                grunt.log.ok("Started simulator with app "+appId);
                sim.client.addEventListener("end", done);
            }, function(err) {
                grunt.fail.warn(err);
                done(false);
            });
        }, function(err) {
            grunt.fail.warn(err);
            done(false);
        });
    });

    grunt.registerTask('open', function(target, version) {
        grunt.task.requires('dev:packaged');

        if(target == 'device') {
            grunt.task.run('ffospush');
        }
        else {
            /*grunt.util.spawn({
                grunt: true,
                args: ['simulator:'+version]
            }, function(err) {
                if(err) {
                    grunt.fail.warn(err);
                }
            });*/
            grunt.task.run('simulator:'+version);
        }
    });

    grunt.registerTask('launch', 'Launch a test version of the app on a FxOS Device or Simulator (use :device or :simulator)', function(target, version) {
        target = target || 'simulator';

        grunt.task.run('dev:packaged');

        grunt.task.run('open:'+target+":"+version);
    });
};
