import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

  this.route('login');
  this.route('register');
  this.route('settings');
  this.route('plans');
  this.route('importer');
  this.route('about');
  this.route('password-reset');
  
  this.resource('entries', function() {
    this.route('new');
    this.route('edit', {path: '/:entry_id/edit'});
    this.route('show', {path: '/:entry_id'});
  });

});

export default Router;
