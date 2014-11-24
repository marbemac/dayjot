import Ember from "ember";
import ResetScroll from "dayjot/mixins/reset-scroll";

export default Ember.Route.extend(ResetScroll, {
  beforeModel: function() {
    if (this.get('session.isAuthenticated')) {
      this.transitionTo('entries');
    }
  }
});