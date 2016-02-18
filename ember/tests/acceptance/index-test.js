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
    equal(currentPath(), 'entries.index', 'it redirects to the entries route');
  });
});

test('clicking login text goes to login route', function() {
  visit('/');
  click('.d-top-half .d-links li:first-child a');
  andThen(function() {
    equal(currentPath(), 'login', 'it goes to the login route');
  });
});

test('navbar active link matches current route', function() {
  const navbar = '.navbar-nav';
  visit('/');
  equal(find(`${navbar} a.active`).attr('href'), '/', 'the home link is active on index route');
  const aboutLink = `${navbar} a[href="/about"]`;
  click(aboutLink);
  andThen(function() {
    equal(find(`${aboutLink}.active`).length, 1, 'the about link is active on the active route');
  });
});

test('clicking about link goes to about route', function() {
  visit('/');
  click('.navbar-nav a[href="/about"]');
  andThen(function(){
    equal(currentURL(), '/about', 'it goes to the correct url');
  });
});

test('clicking login link goes to login route', function() {
  visit('/');
  click('.navbar-nav a[href="/login"]');
  andThen(function(){
    equal(currentURL(), '/login', 'it goes to the correct url');
  });
});

test('visiting login while logged in goes to entries route', function() {
  authenticateSession(App);
  visit('/login');
  andThen(function(){
    equal(currentURL(), '/entries', 'it redirects to entries');
  });
});

test('visiting register while logged in goes to entries route', function() {
  authenticateSession(App);
  visit('/register');
  andThen(function(){
    equal(currentURL(), '/entries', 'it redirects to entries');
  });
});

test('clicking the dayjot logo link while logged in goes to entries route', function() {
  authenticateSession(App);
  visit('/about');
  click('.navbar-brand.d-logo a');
  andThen(function(){
    equal(currentURL(), '/entries', 'it redirects to entries');
  });
});

test('clicking register link goes to register route', function() {
  visit('/');
  click('.navbar-nav a[href="/register"]');
  andThen(function(){
    equal(currentURL(), '/register', 'it goes to the correct url');
  });
});

test('clicking create account link on login page goes to index route', function() {
  visit('/login');
  click('.d-links li:first-child a');
  andThen(function() {
    equal(currentURL(), '/', 'it goes to the correct url');
  });
});

test('clicking forgot password link on login page goes to password-reset route', function() {
  visit('/login');
  click('.d-links li:nth-child(2) a');
  andThen(function() {
    equal(currentURL(), '/password-reset', 'it goes to the correct url');
  });
});

test('clicking a features link on the homepage updates the visible image at the same index', function() {
  visit('/');
  click('.d-features li:nth-child(4)');
  andThen(function() {
    equal(find('.d-feature-container img.on').index(), 3, 'it shows the image with the corresponding index');
  });
});
