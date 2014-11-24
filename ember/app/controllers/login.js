// import Ember from "ember";
// import AuthenticationControllerMixin from 'simple-auth/mixins/authentication-controller-mixin';

// export default Ember.Controller.extend(AuthenticationControllerMixin, {
//   authenticator: "authenticator:parse",
//   working: false,

//   actions: {
//     authenticate: function() {
//       this.set("working", true);
//       var data = this.getProperties('identification', 'password');
//       data.identification = data.identification.toLowerCase();
//       data.controller = this;
//       this.set('password', null);
//       return this._super(data);
//     }
//   }
// });

import Ember from "ember";
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend(LoginControllerMixin, {
  authenticator: 'simple-auth-authenticator:devise'
});