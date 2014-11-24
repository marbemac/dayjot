import Ember from "ember";

export default Ember.View.extend({
  tagName: 'div',
  classNames: ['form-group d-email-time'],
  templateName: 'users/email-time',

  day: null,
  emailTimes: null,

  label: function() {
    return "Don't email me on "+this.get("day").capitalize();
  }.property('day'),

  times: function() {
    var times = [
      {name: "5AM", value: 5},
      {name: "6AM", value: 6},
      {name: "7AM", value: 7},
      {name: "8AM", value: 8},
      {name: "9AM", value: 9},
      {name: "10AM", value: 10},
      {name: "11AM", value: 11},
      {name: "12PM", value: 12},
      {name: "1PM", value: 13},
      {name: "2PM", value: 14},
      {name: "3PM", value: 15},
      {name: "4PM", value: 16},
      {name: "5PM", value: 17},
      {name: "6PM", value: 18},
      {name: "7PM", value: 19},
      {name: "8PM", value: 20},
      {name: "9PM", value: 21},
      {name: "10PM", value: 22},
      {name: "11PM", value: 23}
    ];
    return times;
  }.property(),

  selectionObserver: function() {
    var time = this.get('currentTime') ? parseInt(this.get('currentTime')) : null;
    this.set('controller.model.emailTimes.'+this.get('day'), time);
  }.observes('currentTime'),

  currentTime: function() {
    var time = this.get('emailTimes')[this.get('day')];
    if (time) {
      time = parseInt(time);
    }
    return time;
  }.property('emailTimes')
});