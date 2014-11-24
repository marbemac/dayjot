import PlanRequiredRoute from "../plan-required";

export default PlanRequiredRoute.extend({
  controllerName: 'entries.show',

  model: function() {
    return this.store.createRecord('entry');
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('entryDatePretty', moment().format("MMMM Do, YYYY"));
  }
});
  