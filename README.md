Mines
=====
[![Build Status](https://travis-ci.org/freaktechnik/mines.js.svg)](https://travis-ci.org/freaktechnik/mines.js)

Mines is a webapp minesweeper clone. It orients itself at the Firefox OS style.

Play
----
Mines is available on the following sites:

 * [Web (Release)](http://humanoids.be/mines)
 * [Firefox Marketplace](https://marketplace.firefox.com/app/mines/)
 * [Web (Testing)](http://lab.humanoids.be/mines.js)

Translate
---------
You can contribute translations to the application on [transifex](http://transifex.com/projects/p/mines).

Build
-----

### Build Tools
You'll have to install these tools in order to build the app.

* [npm](https://www.npmjs.com/) (available as package for most Linux distros)
* [Bower](http://bower.io/) (install by running `npm install -g bower` in the command line)
* [Grunt](http://gruntjs.com/) (install by running `npm install -g grunt-cli` in the command line)

### Prepare the Build
There are some third party resources the app uses. Install them by running these commands in the command line:
```
npm install
bower install
```

### Actually Build the App
To build just run `grunt` in the root folder of the repository. This will build a development grade version of the application in the dist/ folder.

Grunt can do a plethora of things, like cleaning the project directory with `grunt clean`. To see a full list of its targets, run `grunt --help`.
