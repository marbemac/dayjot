import Ember from 'ember';
import startApp from '../helpers/start-app';

var App;

module('Acceptance: Index', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

// visiting index without being logged in should render the header text
test('visiting /', function() {
  visit('/');

  andThen(function() {
    equal(currentPath(), 'index', 'the current path is index');
    const headerText = find('.d-large-logo h4').text();
    equal(headerText, 'Get started below, DayJot is completely free for 30 days.', 'header text is correctly displayed');
  });
});
