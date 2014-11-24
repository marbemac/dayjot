import Ember from "ember";
import Notify from 'ember-notify';

export default Ember.ObjectController.extend({
  errors: null,
  saving: false,
  previewing: false,
  entryDatePretty: null,
  nextEntry: null,
  randomEntry: null,
  prevEntry: null,

  entryDidChange: function() {
    this.set('saving', false);
    this.set('errors', null);
    if (!this.get('model.entryDate')) {
      this.set('model.entryDate', new Date());
    }
  }.observes('model'),

  dateDidChange: function() {
    this.set('model.entryDate', moment(this.get('entryDatePretty'), "MMMM Do, YYYY").utc().toDate());
  }.observes('entryDatePretty'),

  actions: {
    remove: function() {
      this.removeEntry();
    },
    save: function() {
      this.saveEntry();
    },
    togglePreview: function() {
      this.set('previewing', !this.get('previewing'));
    }
  },

  saveEntry: function() {
    this.set('errors', null);
    this.set('saving', true);
    var _this = this,
        user = this.get('session.currentUser');

    this.get('model').save().then(function() {
      user.refresh();
      _this.set('saving', false);
      _this.transitionToRoute('entries.show', _this.get('model.entryDate'));
      Notify.success('Entry saved.');
    }, function(data) {
      _this.set('saving', false);
      _this.set('errors', data.errors);
      Notify.error(data.errors[0], {closeAfter: 5000});
    });
  },

  removeEntry: function () {
    var r = confirm("Are you sure you want to erase this entry? This cannot be undone.");
    if (r === true) {
      var entry = this.get('model'),
        _this = this;

      entry.deleteRecord();
      entry.save().then(function() {
        Notify.success('Entry erased.', {closeAfter: 5000});
        var user = _this.get('session.currentUser');
        user.refresh();
      });
    }
  }
});  