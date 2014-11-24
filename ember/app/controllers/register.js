import Ember from "ember";

export default Ember.ObjectController.extend({
  needs: 'settings',

  user: null,
  password: null,
  email: null,

  errors: null,
  working: false,

  actions: {
    register: function() {
      this.registerUser();
    }
  },

  registerUser: function() {
    var _this = this,
        data = {
          email: this.get('email'),
          password: this.get('password')            
        };
        
    // set the user's timezone
    var zones = this.get('controllers.settings.zones'),
        offset = moment().format('Z').split(':')[0],
        chosenZone = null;
    for (var i = 0; i < zones.length; i++) {
      if (zones[i].offset === offset) {
        chosenZone = zones[i];
        break;
      }
    }
    if (chosenZone) {
      data.timeZone = chosenZone.value;
    }

    // Initialize the user
    if (!this.get('user')) {
      this.set('user', this.get('store').createRecord('user'));
    }
    this.get('user').setProperties(data);

    // Save the user
    this.set('working', true);
    this.get('user').save().then(function() {
      _this.set('user', null);
      _this.get('session').authenticate('simple-auth-authenticator:devise', {identification: data.email, password: data.password});  
    }, function(data) {
      _this.set('working', false);
      _this.set('errors', data.errors);
    });
  }
});