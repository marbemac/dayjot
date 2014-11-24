import DS from "ember-data";

export default DS.Model.extend({
  body: DS.attr('string'),

  entryDate: DS.attr(),
  occurredAtYearMonth: DS.attr('string', {readOnly: true}),

  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),

  timestamp: function() {
    return moment(this.get('entryDate')).unix();
  }.property('entryDate')
});