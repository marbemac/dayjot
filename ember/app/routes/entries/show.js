import PlanRequiredRoute from "../plan-required";
import Notify from 'ember-notify';

export default PlanRequiredRoute.extend({
  model: function(params) {
    var _this = this;

    return this.store.find('entry', params.entry_id).then(function(entry) {
      // Force a reload if the meta data is out of date
      var meta = _this.store.metadataFor("entry");
      if (meta.current_entry !== entry.get('entryDate')) {
        return entry.reload();
      } else {
        return entry;
      }      
    }, function(data) {
      if (data.status === 404) {
        // Set the meta data
        var meta = data.responseJSON.meta;
        _this.store.metaForType("entry", meta);

        // Build the dummy record, for use in the new form
        var entry = _this.store.createRecord('entry', {
          entryDate: params.entry_id
        });

        return entry;
      } else {
        Notify.error(data.responseText, {closeAfter: 5000});
      }
    });
  },
  setupController: function(controller, model) {
    this._super(controller, model);
    var meta = this.store.metadataFor("entry");
    controller.setProperties({
      nextEntry: meta.next_entry,
      randomEntry: meta.random_entry,
      prevEntry: meta.prev_entry,
      entryDatePretty: moment(model.get('entryDate')).format("MMMM Do, YYYY")
    });
  }
});
  