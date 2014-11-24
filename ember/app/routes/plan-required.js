import Ember from "ember";
// import Notify from 'ember-notify';

export default Ember.Route.extend({
  beforeModel: function() {
    if (!this.get('session.isAuthenticated')) {
      this.transitionTo('index');
    } //else {
    //   if (this.get('session.currentUser.mustSubscribe')) {
    //     this.transitionTo('plans');
    //     Notify.error('Become an active member to view that page.');        
    //   }
    // }
  }
});