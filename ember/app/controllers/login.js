import Ember from "ember";

export default Ember.Controller.extend({
  authenticator: 'simple-auth-authenticator:devise',

  identification: null,
  password: null,
  error: null,
  working: false,

  actions: {
    authenticate: function() {
      var _this = this,
          data = this.getProperties('identification', 'password');

      this.setProperties({
        working: true,
        password: null,
        error: null
      });
      
      this.get('session').authenticate('simple-auth-authenticator:devise', data).then(function() {
        // authentication was successful
      }, function(data) {
        _this.set('working', false);
        _this.set('error', data.error);
      });
    }
  }
});