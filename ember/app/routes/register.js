import Ember from "ember";

export default Ember.Route.extend({
  activate: function() {
    if (this.get('session').isAuthenticated) {
      this.transitionTo('entries');
    }
  }
});