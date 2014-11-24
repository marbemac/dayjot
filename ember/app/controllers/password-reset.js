import Ember from "ember";
import ENV from "dayjot/config/environment";
import Notify from 'ember-notify';

export default Ember.Controller.extend({
  queryParams: ['reset_password_token'],
  reset_password_token: null,

  message: null,

  errors: null,
  working: false,
  done: false,

  email: null,
  newPassword1: null,
  newPassword2: null,

  actions: {
    start: function() {
      var _this = this;
        
      this.set('working', true);
      Ember.$.ajax({
        url: ENV.APP.API_HOST + "/start_password_reset",
        type: "POST",
        data: {email: _this.get("email")},
        dataType: 'json',
        success: function() {
          _this.set('errors', null);
          _this.set('working', false);
          _this.set('done', true);
          _this.set('message', 'Please check your email. If the email you specified exists in our system, we\'ve sent a password reset link to it.');
        },
        error: function(data) {
          _this.set('working', false);
          _this.set('errors', data);
        }
      });
    },
    finish: function() {
      var _this = this,
          data = {
            reset_password_token: this.get('reset_password_token'),
            password: this.get('newPassword1'),
            password_confirmation: this.get('newPassword2')
          };
        
      this.set('working', true);
      Ember.$.ajax({
        url: ENV.APP.API_HOST + "/finish_password_reset",
        type: "PUT",
        data: data,
        dataType: 'json',
        success: function() {
          _this.set('errors', null);
          _this.set('working', false);
          Notify.success("Password updated, please login.", {closeAfter: 5000});
          _this.transitionToRoute('login');
        },
        error: function(data) {
          _this.set('working', false);
          _this.set('errors', data.responseJSON.errors);
          if (data.status === 403) {
            _this.transitionToRoute('password-reset', {queryParams: {reset_password_token: null}});
          }
        }
      });
    }
  }  
});  