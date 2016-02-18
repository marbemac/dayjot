import Ember from 'ember';
import startApp from '../helpers/start-app';
import initializeTestHelpers from 'simple-auth-testing/test-helpers';

var App;

module('Acceptance: Index', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting index while logged out displays homepage content', function() {
  visit('/');

  andThen(function() {
    equal(currentPath(), 'index', 'the current path is index');
    const headerText = find('.d-large-logo h4').text();
    equal(headerText, 'Get started below, DayJot is completely free for 30 days.', 'header text is correctly displayed');
  });

});

test('visiting index while logged in redirects to entries', function() {
  authenticateSession(App);

  visit('/');

  andThen(function() {
    equal(currentPath(), 'entries.index', 'it redirects to the entries page');
  });
});
