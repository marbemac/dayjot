import Ember from "ember";
import Notify from 'ember-notify';
import ENV from 'dayjot/config/environment';

export default Ember.ObjectController.extend({
  errorMessage: null,
  saving: false,
  canceling: false,
  emailTimesUpdated: null,
  correctedEmailTimes: {},
  exporting: false,
  deleting: false,

  planInDollars: function() {
    return this.get('model.plan').split('_')[1];
  }.property('plan'),

  zones: function() {
    var zones = ['Iceland','Europe/London','Europe/Madrid','Europe/Athens','Asia/Tehran','Europe/Moscow',
                'Asia/Kabul','Asia/Calcutta','Indian/Chagos','Asia/Bangkok','Asia/Shanghai','Asia/Tokyo',
                'Pacific/Guam','Australia/Melbourne','Pacific/Fiji','Pacific/Auckland','Pacific/Apia',
                'Atlantic/Cape_Verde','Brazil/East','US/Eastern','US/Central','US/Mountain','US/Pacific',
                'US/Alaska','US/Aleutian','Pacific/Honolulu','Pacific/Midway'];
    var zoneData = [];
    var now;
    for (var i = 0; i < zones.length; i++) {
      now = moment().tz(zones[i]);
      zoneData.push({
        'name': zones[i]+', '+now.format('h:mma'),
        'offset': now.format('Z').split(':')[0],
        'value': zones[i]
      });
    }
    zoneData = _.sortBy(zoneData, 'offset');
    return zoneData;
  }.property(),

  actions: {
    cancel: function() {
      this.cancel();
    },
    saveEmailSettings: function() {
      var _this = this;
      this.set('saving', true);
      this.get('model').save().then(function() {
        _this.set('saving', null);
        Notify.success("Settings saved.", {closeAfter: 3000});
      }, function(err) {
        _this.set('saving', null);
        Notify.error(err.message, {closeAfter: 5000});
      });
    },
    export: function() {
      var _this = this;
      this.set('exporting', true);
      Ember.$.ajax({
        url: ENV.APP.API_HOST + '/entries/export',
        type: 'POST',
        dataType: 'json'
      }).then(function() {
        _this.set('exporting', false);
        Notify.success("Export in progress! Look for an email in the next hour.", {closeAfter: 5000});
      }, function(err) {
        _this.set('exporting', false);
        Notify.error(err.responseJSON.error, {closeAfter: 5000});
      });
    },
    delete: function() {
      var r = confirm("Are you sure you want to erase ALL of your entries? This cannot be undone.");
      if (r === true) {
        var r2 = confirm("Ok.. but really? Are you sure.. just double checking.");
        if (r2 === true) {
          var _this = this;
          this.set('deleting', true);
          Ember.$.ajax({
            url: ENV.APP.API_HOST + '/entries',
            type: 'DELETE',
            dataType: 'json'
          }).then(function() {
            window.location = "/entries";
          }, function(err) {
            _this.set('deleting', false);
            Notify.error(err.responseJSON.error, {closeAfter: 5000});
          });
        }
      }
    }
  },

  cancel: function() {
    var r = confirm("Are you sure you want to cancel your subscription?");
    if (r === true) {
      var _this = this,
          user = this.get('session.currentUser');
          
      this.set('canceling', true);

      Ember.$.ajax({
        url: ENV.APP.API_HOST + "/cancel_plan",
        type: "POST",
        dataType: 'json',
        success: function() {
          user.refresh().then(function() {            
            _this.set('canceling', false);
            Notify.success("Subscription cancelled.");
          });
        },
        error: function(err) {
          _this.set('canceling', false);
          Notify.error(err.message, {closeAfter: 5000});
        }
      });
    }
  }
});  