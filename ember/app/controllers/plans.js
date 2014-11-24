import Ember from "ember";
import ENV from 'dayjot/config/environment';
import Notify from 'ember-notify';

export default Ember.Controller.extend({
  processing: false,
  stripeKey: ENV.APP.STRIPE_KEY,
  errorMessage: null,
  redirecting: false,
  planValue: null,
  planId: null,
  planText: null,

  hasPlan: function() {
    return this.get('model.plan') ? true : false;
  }.property('model.plan'),

  isPlanActive: function() {
    return this.get('model.planStatus') === 'active' ? true : false;
  }.property('model.planStatus'),

  actions: {
    startPlan: function() {
      this.startPurchase(this.get('planId'), 'DayJot', this.get('planValue') + ' per month');
    },
    updatePlan: function() {
      this.updatePlan(this.get('planId'));
    }
  },

  startPurchase: function(plan, name, description) {
    var _this = this;
    
    Ember.run.next(function() {
      StripeCheckout.open({
        key:             _this.get('stripeKey'),
        name:            name,
        description:     description,
        allowRememberMe: false,
        email:           _this.get('session.currentUser.email'),
        panelLabel:      "Subscribe",
        token:           function(result) {
          _this.sendPurchase(plan, result.id);
        }
      });
    });
  },

  sendPurchase: function(plan, token) {
    var _this = this,
        user = this.get('session.currentUser');
        
    this.set('processing', true);
    Ember.$.ajax({
      url: ENV.APP.API_HOST + "/update_plan",
      type: "POST",
      data: {plan: plan, token: token},
      dataType: 'json',
      success: function() {
        _this.set('processing', false);
        _this.set('redirecting', true);
        user.refresh().then(function() {
          _this.transitionToRoute('entries');
          Notify.success('Successfully subscribed!');
          setTimeout(function() {
            _this.set('redirecting', false);          
          }, 1000);          
        });
      },
      error: function(error) {
        _this.set('processing', false);
        _this.set('errorMessage', error.responseJSON.error);
      }
    });
  },

  updatePlan: function(plan) {
    var _this = this,
        user = this.get('session.currentUser');
        
    this.set('processing', true);
    Ember.$.ajax({
      url: ENV.APP.API_HOST + "/update_plan",
      type: "POST",
      data: {plan: plan},
      dataType: 'json',
      success: function() {
        _this.set('processing', false);
        _this.set('redirecting', true);
        user.refresh().then(function() {
          _this.transitionToRoute('entries');
          Notify.success('Subscription updated.');
          setTimeout(function() {
            _this.set('redirecting', false);          
          }, 1000);          
        });
      },
      error: function(error) {
        _this.set('processing', false);
        _this.set('errorMessage', error.responseJSON.error);
      }
    });
  }

});