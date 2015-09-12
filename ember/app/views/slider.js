import Ember from "ember";

var plans = [
  {
    value: "$3",
    plan: "monthly_3",
    text: "a Tazo Chai Tea Latte.",
    index: 0
  },
  {
    value: "$4",
    plan: "monthly_4",
    text: "a Double-Double, animal style.",
    index: 1
  },
  {
    value: "$5",
    plan: "monthly_5",
    text: "Sharknado on DVD.",
    index: 2
  },
  {
    value: "$7",
    plan: "monthly_7",
    text: "a 4-pack of Dogfish Head 90 Minute IPA.",
    index: 3
  },
  {
    value: "$10",
    plan: "monthly_10",
    text: "a night at the movies. By yourself.",
    index: 4
  },
  {
    value: "$15",
    plan: "monthly_15",
    text: "an electronic butterfly in a jar.",
    index: 5
  },
  {
    value: "$20",
    plan: "monthly_20",
    text: "a Super Mario costume, child size.",
    index: 6
  },
  {
    value: "$30",
    plan: "monthly_30",
    text: "a pair of giant robot slippers with sound.",
    index: 7
  },
  {
    value: "$50",
    plan: "monthly_50",
    text: "a Han Solo in carbonite rug.",
    index: 8
  },
  {
    value: "$75",
    plan: "monthly_75",
    text: "a Gandalf pipe prop replica.",
    index: 9
  },
  {
    value: "$100",
    plan: "monthly_100",
    text: "our eternal love.",
    index: 10
  }
];

export default Ember.View.extend({
  tagName: 'div',
  templateName: 'slider',
  startValue: null,
  currentValue: null,

  updatePlan: function() {
    this.set('controller.planValue', plans[this.get('currentValue')-1].value);
    this.set('controller.planId', plans[this.get('currentValue')-1].plan);
    this.set('controller.planText', plans[this.get('currentValue')-1].text);
  }.observes('currentValue'),

  didInsertElement: function() {
    var _this = this,
        plan = this.get('startValue') ? _.findWhere(plans, {plan: this.get('startValue')}) : plans[0];

    if (!plan || typeof plan === 'undefined') {
      plan = plans[0]
    }

    _this.set('currentValue', plan.index + 1);
    this.$('.slider').slider({
      range: "min",
      step: 1,
      min: 1,
      max: 11,
      value: _this.get('currentValue'),
      slide: function( event, ui ) {
        _this.set('currentValue', ui.value);
      }
    });
  }
});
