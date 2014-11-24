// ember-simple-auth
import Ember from "ember";
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';
import Notify from 'ember-notify';
import ENV from 'dayjot/config/environment';

export default Ember.Route.extend(ApplicationRouteMixin, {
  beforeModel: function(transition) {
    this._super(transition);    
    return this.setCurrentUser();
  },
  actions: {
    sessionAuthenticationFailed: function(data) {
      this.controllerFor('login').set('working', false);
      this.controllerFor('login').set('loginErrorMessage', data.message);
    },
    sessionInvalidationSucceeded: function() {
      this.transitionTo('index');
    },
    sessionAuthenticationSucceeded: function() {
      var _this = this;
      this.controllerFor('login').set('working', false);

      this.setCurrentUser().then(function() {
        if (_this.get('session.currentUser.mustSubscribe')) {
          _this.transitionTo('plans');
        } else {
          _this.transitionTo('entries');
        }
      });      
    },
    authorizationFailed: function() {
      Notify.error("Could not be authenticated.. signing out.", {closeAfter: 5000});
      this.get('session').invalidate();
    },
    search: function(term) {
      this.transitionTo('entries', {queryParams: {search: term}});
    }
  },

  setCurrentUser: function() {
    
    var _this = this,
        adapter = this.get('store').adapterFor('user');
    
    if (this.get('session.isAuthenticated')) {
      return new Ember.RSVP.Promise(function(resolve) {
        adapter.ajax(ENV.APP.API_HOST + "/users/me", "GET", {}).then(
          function(response){
            _this.store.pushPayload(response);
            var user = _this.store.find('user', response.user.id);
            resolve(user);
          },
          function(response){
            resolve(response);
          }
        );
      }).then(function(user) {
        _this.set('session.currentUser', user);  
      }, function() {
        Notify.error("Could not be authenticated.. signing out.", {closeAfter: 5000});
        _this.get('session').invalidate();
      });
    } else {
      return new Ember.RSVP.Promise(function(resolve){ resolve(); });
    }
  }
});