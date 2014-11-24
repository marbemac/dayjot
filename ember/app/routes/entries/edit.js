import PlanRequiredRoute from "../plan-required";

export default PlanRequiredRoute.extend({
  controllerName: 'entries.show',

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('entryDatePretty', moment(model.get('entryDate')).format("MMMM Do, YYYY"));
  }
});
  