import Ember from "ember";
import DS from "ember-data";
import ENV from 'dayjot/config/environment';

export default DS.Model.extend({
  lastUpdated: 0,

  email: DS.attr('string'),
  password: DS.attr('string'),
  passwordConfirmation: DS.attr('string'),
  encryptEntries: DS.attr('boolean'),

  status: DS.attr('string', {readOnly: true}),
  plan: DS.attr('string', {readOnly: true}),
  planStatus: DS.attr('string', {readOnly: true}),
  planStarted: DS.attr('date', {readOnly: true}),
  planCanceled: DS.attr('date', {readOnly: true}),
  trialEnd: DS.attr('date', {readOnly: true}),
  entryMonths: DS.attr('object', {readOnly: true}),
  
  timeZone: DS.attr('string'),
  emailTimes: DS.attr('object'),
  includeEmailMemory: DS.attr('boolean'),

  createdAt: DS.attr('date', {readOnly: true}),

  planActive: function() {
    if (this.get('status') === 'active' && (this.get('planStatus') === 'active' || this.get('trialActive'))) {
      return true;
    } else {
      return false;
    }
  }.property('status','planStatus'),

  planInactive: function() {
    return this.get('planActive') ? false : true;
  }.property('planActive'),

  trialActive: function() {
    return (this.get('trialEnd') >= new Date()) ? true : false;
  }.property('createdAt'),

  shouldSubscribe: function() {
    if (this.get('planStatus') !== 'active') {
      return true;
    } else {
      return false;
    }
  }.property('status','planStatus'),

  mustSubscribe: function() {
    if (this.get('status') !== 'active' || (!this.get('trialActive') && this.get('planStatus') !== 'active')) {
      return true;
    } else {
      return false;
    }
  }.property('status','trialActive','planStatus'),

  planWasCanceled: function() {
    return this.get('planStatus') === 'canceled' ? true : false;
  }.property('planStatus'),

  // Refreshes the user session and updates the user 
  // properties (called on page refresh in application route)
  refresh: function(){
    var adapter = this.get('store').adapterFor(this),
        _this = this;
    return new Ember.RSVP.Promise(function(resolve) {
      adapter.ajax(ENV.APP.API_HOST + "/users/me", "GET", {}).then(
        function(response){
          _this.store.pushPayload(response);
          _this.set('lastUpdated', new Date());
          resolve(response);
        },
        function(response){
          resolve();
          console.log('USER REFRESH FAILED: ');
          console.log(response);
        }
      );
    });
  }
});