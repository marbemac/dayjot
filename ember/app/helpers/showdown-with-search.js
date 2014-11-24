import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(value, search) {
  if (typeof value === 'string') {
    var converter = new Showdown.converter(),
        html = converter.makeHtml(value),
        reg = new RegExp(search, 'gi'),
        highlighted_html = html.replace(reg, function(str) { return '<span class="highlight">'+str+'</span>'; });

    return new Ember.Handlebars.SafeString(highlighted_html);
  }
});