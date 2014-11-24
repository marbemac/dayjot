import Ember from "ember";

export default Ember.View.extend({
  actions: {
    activateFeatureTab: function(which) {
      this.$('.d-feature-container img:nth-child('+which+')').addClass('on').siblings().removeClass('on');
      this.$('.d-feature-container li:nth-child('+which+')').addClass('on').siblings().removeClass('on');
    }
  }
});