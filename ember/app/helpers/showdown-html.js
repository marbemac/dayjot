import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(value) {
  if (typeof value === 'string') {
    var converter = new Showdown.converter();
    return new Ember.Handlebars.SafeString(converter.makeHtml(value));
  }
});