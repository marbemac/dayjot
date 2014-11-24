import Ember from "ember";

export default Ember.Controller.extend({
  needs: "register",
  working: Ember.computed.alias('controllers.register.working'),
  errors: Ember.computed.alias('controllers.register.errors'),
  email: Ember.computed.alias('controllers.register.email'),
  password: Ember.computed.alias('controllers.register.password'),
  actions: {
    register: function() {
      this.get('controllers.register').registerUser();
    },
    focusRegister: function() {
      var target = $('.d-auth-form input:first');
      target.focus();
      $('html, body').animate({
        scrollTop: 0
      }, 500);
    }
  }
});