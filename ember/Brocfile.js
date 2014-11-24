/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

app.import('vendor/js/bootstrap.js');
app.import('vendor/js/underscore.js');
app.import('vendor/js/pikaday.js');
app.import('vendor/js/pikaday.jquery.js');
app.import('vendor/js/jquery-ui.js');
app.import('bower_components/jquery-autosize/jquery.autosize.js');
app.import('bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020.min.js');

module.exports = app.toTree();
