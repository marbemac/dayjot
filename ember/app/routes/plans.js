import Ember from "ember";
import ResetScroll from "dayjot/mixins/reset-scroll";

export default Ember.Route.extend(ResetScroll, {
  setupController: function(controller) {
    controller.set('model', this.get('session.currentUser'));
  }
});