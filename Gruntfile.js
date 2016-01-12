var deploySim = require('fxos-deploy');
var connectSim = require('fxos-connect');

//TODO don't include source-viewer in web version

module.exports = function(grunt) {
    // Project configuration.
    var bowerDevDeps = Object.keys(grunt.file.readJSON('bower.json').devDependencies);
    bowerDevDeps.push("WeakMap");

    grunt.initConfig({
        iconFile: 'icon-*.png',
        distdir: 'dist/',
        // Subfolders of the distdir where stuff gets placed
        dist: {
            html: '',
            image: 'images/',
            locale: 'locales/',
            script: 'scripts/',
            bower: 'vendor/',
            style: 'styles/',
            font: 'font/',
            icon: '<%= dist.image %><%= iconFile %>'
        },
        // Asset directory locations
        assetdir: 'assets',
        src: {
            //!!! If you move any of these directories out of assetdir (With the exception of locales) watch will break, so adjust it, too!
            html: '<%= assetdir %>',
            script: '<%= assetdir %>/scripts',
            style: '<%= assetdir %>/styles',
            image: '<%= assetdir %>/images',
            font: '<%= assetdir %>/font',
            locale: 'locales',
            icon: '<%= src.image %>/<%= iconFile %>',
            include: '<%= assetdir %>/include'
        },
        pkg: grunt.file.readJSON('package.json'),
        mpAPICreds: grunt.file.readJSON('.marketplacerc'),
        banner:
            '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name || pkg.author %>;\n' +
            ' * This Source Code Form is subject to the terms of the Mozilla Public License,\n' +
            ' * v. 2.0. If a copy of the MPL was not distributed with this file, You can\n' +
            ' * obtain one at https://mozilla.org/MPL/2.0/.\n */\n',
        // These JS statements are expanded after the config was set, so the used config values are defined.
        locales: '<%= grunt.file.expand({cwd:grunt.config("src.locale")}, "*").join(",") %>',
        sourceLocale: 'en',
        // This lists the sizes of the icon files for the head preprocessing.
        iconSizes: '<%= JSON.stringify(grunt.file.expand({cwd: grunt.config("src.image")}, grunt.config("iconFile")).map(function(fn) {return fn.match(new RegExp(grunt.config("iconFile").replace("*", "([0-9]+)")))[1];})) %>',
        targetEnv: "web",
        dev: false,
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: '**/*.js',
                        dest: '<%= distdir %><%= dist.script %>',
                        ext: '.min.js'
                    },
                    {
                        expand: true,
                        cwd: '<%= src.script %>',
                        src: '**/*.js',
                        dest: '<%= distdir %><%= dist.script %>',
                        ext: '.min.js'
                    }
                ]
            }
        },
        cssmin: {
            build: {
                files: [{
                    expand: true,
                    cwd: '<%= src.style %>',
                    src: ['*.css'],
                    dest: '<%= distdir %><%= dist.style %>',
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
                    src: ['Gruntfile.js', '<%= src.script %>/**/*.js', 'src/**/*.js', 'test/**/*.js', '!test/dist/**']
                }
            }
        },
        bower: {
            build: {
                dest: '<%= distdir %><%= dist.bower %>',
                options: {
                    expand: true,
                    ignorePackages: bowerDevDeps,
                    packageSpecific: {
                        'gaia-fonts': {
                            files: [
                                'fonts/**',
                                'style.css'
                            ]
                        },
                        'fira': {
                            files: [
                                'eot/FiraSans-*',
                                'eot/FiraMono-*',
                                'woff/FiraSans-*',
                                'woff/FiraMono-*',
                                'ttf/*',
                                'fira.css'
                            ]
                        },
                        'webcomponentsjs': {
                            files: [ 'webcomponents.min.js' ]
                        }
                    }
                }
            }
        },
        copy: {
            dev: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= src.script %>',
                        src: '**/*.js',
                        dest: '<%= distdir %><%= dist.script %>',
                        ext: '.min.js'
                    },
                    {
                        expand: true,
                        cwd: '<%= src.style %>',
                        src: ['*.css'],
                        dest: '<%= distdir %><%= dist.style %>',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        cwd: 'src',
                        src: '**/*.js',
                        dest: '<%= distdir %><%= dist.script %>',
                        ext: '.min.js'
                    }
                ]
            },
            build: {
               files: [
                    {
                        expand: true,
                        cwd: '<%= src.locale %>',
                        src: ['*/app.properties'],
                        dest: '<%= distdir %><%= dist.locale %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= src.font %>',
                        src: ['**'],
                        dest: '<%= distdir %><%= dist.font %>'
                    },
                    {
                        expand: true,
                        cwd: '<%= src.image %>',
                        src: ['**/*.png', '**/*.svg', '**/*.jpg'],
                        dest: '<%= distdir %><%= dist.image %>'
                    },
                    {
                        cwd: '.',
                        src: ['LICENSE'],
                        dest: '<%= distdir %>'
                    }
                ]
            },
            packages: {
                files: [
                    {
                        expand: true,
                        cwd: 'node_modules',
                        src: ['babel-polyfill/dist/polyfill.min.js'],
                        dest: '<%= distdir %><%= dist.bower %>'
                    }
                ]
            }
        },
        transifex: {
            mines_properties: {
                options: {
                    targetDir: '<%= src.locale %>',
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
                    targetDir: '<%= src.locale %>',
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
        babel: {
            options: {
                plugins: [
                    'transform-es2015-arrow-functions',
                    'transform-es2015-block-scoped-functions',
                    'transform-es2015-block-scoping',
                    'transform-es2015-classes',
                    'transform-es2015-computed-properties',
                    'transform-es2015-destructuring',
                    'transform-es2015-for-of',
                    'transform-es2015-function-name',
                    'transform-es2015-literals',
                    'transform-es2015-object-super',
                    'transform-es2015-parameters',
                    'transform-es2015-shorthand-properties',
                    'transform-es2015-spread',
                    'transform-es2015-sticky-regex',
                    'transform-es2015-template-literals',
                    'transform-es2015-typeof-symbol',
                    'transform-es2015-unicode-regex',
                    'transform-regenerator'
                ]
            },
            bowerlibs: {
                files: [
                    {
                        expand: true,
                        cwd: "<%= distdir %><%= dist.bower %>",
                        src: ['gaia-*/*.js'],
                        dest: '<%= distdir %><%= dist.bower %>'
                    }
                ]
            },
            test: {
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: ["**/*.js"],
                        dest: "test/dist"
                    },
                    {
                        expand: true,
                        cwd: "<%= src.script %>",
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
                files: ['<%= assetdir %>/**/*', 'src/*', 'manifest.webapp', '<%= src.locale %>/en/*', '!**/*~'],
                tasks: 'dev'
            },
            packaged: {
                files: ['<%= assetdir %>/**/*', 'src/*', 'manifest.webapp', '<% src.locale %>/en/*', '!**/*~'],
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
            }
        },
        validatewebapp: {
            options: {
                listed: true,
                packaged: true
            },
            main: { src: '<%= distdir %>manifest.webapp' }
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
                    'WCAG2A.Principle1.Guideline1_3.1_3_1.H85.2',
                    'WCAG2A.Principle1.Guideline1_3.1_3_1.H73.3.NoSummary'
                ]
            },
            main: {
                expand: true,
                cwd: '<%= distdir %><%= dist.html %>',
                src: '*.html'
            }
        },
        appcache: {
            options: {
                basePath: '<%= distdir %>'
            },
            web: {
                dest: '<%= distdir %>manifest.appcache',
                cache: '<%= distdir %>**/*'
            }
        },
        webapp: {
            options: {
                localeDir: '<%= src.locale %>',
                icons: '<%= src.icon %>',
                version: '<%= pkg.version %>',
                iconsTarget: '<%= targetEnv != "web" ? "/":"" %><%= grunt.config("dist.icon").replace("*", "{size}") %>'
            },
            web: {
                options: {
                    target: 'web'
                },
                files: [{ '<%= distdir %>manifest.webapp': 'manifest.webapp' }]
            },
            packaged: {
                options: {
                    target: 'packaged'
                },
                files: [{ '<%= distdir %>manifest.webapp': 'manifest.webapp' }]
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
                    src: ['<%= distdir %>manifest.webapp']
                }]
            }
        },
        preprocess: {
            options: {
                context: {
                    SCRIPT_DIR: '<%= dist.script %>',
                    STYLE_DIR: '<%= dist.style %>',
                    FONT_DIR: '<%= dist.font %>',
                    IMAGE_DIR: '<%= dist.image %>',
                    LOCALE_DIR: '<%= dist.locale %>',
                    HTML_DIR: '<%= dist.html %>',
                    VENDOR_DIR: '<%= dist.bower %>',
                    LOCALES: '<%= locales %>',
                    DEFAULT_LOCALE: '<%= sourceLocale %>',
                    ICON_SIZES: '<%= iconSizes %>',
                    ICON_NAME: function(size) {
                        return grunt.config('dist.icon').replace('*', size);
                    },
                    TARGET_ENV: '<%= targetEnv %>',
                    TAG: '<%= githash.main.hash %>',
                    VERSION: '<%= pkg.version %>'
                },
                srcDir: '<%= src.include %>'
            },
            html: {
                expand: true,
                cwd: '<%= src.html %>',
                src: ['*.html'],
                dest: '<%= distdir %><%= dist.html %>'
            }
        },
        htmllint: {
            test: {
                options: {
                    ignore: [
                        /Bad value “(localization|jslicense)” for attribute “rel” on element “link”/,
                        'Bad value ”<%= dist.locale %>{locale}/app.properties” for attribute “href” on element “link”: Illegal character in path segment: not a URL code point.',
                        /gaia-header/,
                        /(Article|Section) lacks heading. Consider using “h2”-“h6” elements to add identifying headings to all (sections|articles)./,
                        /The “(details|menu)” element is not supported( properly)? by browsers yet./,
                        "Attribute “referrer” not allowed on element “iframe” at this point."
                    ]
                },
                files: {
                    src: [ '<%= distdir %><%= dist.html %>*.html' ]
                }
            }
        },
        githash : {
            main: {
                options: {}
            }
        },
        'sw-precache': {
            options: {
                cacheId: '<%= pkg.name %>',
                workerFileName: 'service-worker.js',
                baseDir: '<%= distdir %>',
                stripPrefix: '<%= distdir %>'
            },
            build: {
                staticFileGlobs: [
                    '**/*'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-bower');
    grunt.loadNpmTasks('grunt-transifex');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-validate-webapp');
    grunt.loadNpmTasks('grunt-accessibility');
    grunt.loadNpmTasks('grunt-appcache');
    grunt.loadNpmTasks('grunt-webapp');
    grunt.loadNpmTasks('grunt-ftp-deploy');
    grunt.loadNpmTasks('grunt-firefoxos');
    grunt.loadNpmTasks('grunt-marketplace');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-html');
    grunt.loadNpmTasks('grunt-githash');
    grunt.loadNpmTasks('grunt-sw-precache');

    // Default task(s).
    grunt.registerTask('default', ['build:web']);

    grunt.registerTask('build', 'Build the webapp for the web or as a package (use :web or :packaged)', function(env) {
        env = env || 'web';
        grunt.config.set('targetEnv', env);

        grunt.task.run('githash');

        grunt.task.run('transifex');

        grunt.task.run('uglify');
        grunt.task.run('bower');
        grunt.task.run('cssmin');
        grunt.task.run('preprocess:html');
        grunt.task.run('copy:build');
        grunt.task.run('copy:packages');
        grunt.task.run('webapp:'+env);
        grunt.task.run('babel:bowerlibs');

        if(env == 'packaged') {
            grunt.task.run('compress:build');
        }
        else {
            grunt.task.run('sw-precache');
            grunt.task.run('appcache');
        }
    });

    grunt.registerTask('set-pre-version', 'Set the deversion with git hashes and all that', function(env) {
        grunt.task.requires('githash');
        grunt.config.set('dev', true);
        grunt.config.set('pkg.version', grunt.config('pkg.version') + "-pre+" + grunt.config('githash.main.short'));
    });

    grunt.registerTask('dev', 'Build an unminified version of the app (use :web or :packaged)', function(env) {
        env = env || 'web';
        grunt.config.set('targetEnv', env);

        grunt.task.run('githash');
        grunt.task.run('set-pre-version');

        grunt.task.run('bower');
        grunt.task.run('copy:dev');
        grunt.task.run('preprocess:html');
        grunt.task.run('copy:build');
        grunt.task.run('copy:packages');
        grunt.task.run('webapp:'+env);
        grunt.task.run('babel:bowerlibs');

        if(env == 'packaged') {
            grunt.task.run('compress:build');
        }
        else {
            grunt.task.run('sw-precache');
            grunt.task.run('appcache');
        }
    });

    grunt.registerTask('test', 'Run tests and validations', ['webapp:packaged', 'copy:build', 'jshint', 'validatewebapp', 'preprocess:html', 'accessibility', 'htmllint', 'babel:test', 'qunit', 'clean']);

    grunt.registerTask('deploy', 'Deoply the app, targets are :web or :packaged', function(env) {
        env = env || 'web';

        grunt.task.run('clean');
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

        grunt.task.run('clean');
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
            if((!version || version == "undefined") && target != "simulator")
                version = target;

            grunt.task.run('simulator:'+version);
        }
    });

    grunt.registerTask('launch', 'Launch a test version of the app on a FxOS Device or Simulator (use :device or :simulator:version)', function(target, version) {
        target = target || 'simulator';

        grunt.task.run('dev:packaged');

        grunt.task.run('open:'+target+":"+version);
    });
};
