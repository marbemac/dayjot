import Ember from "ember";

export default Ember.View.extend({
  templateName: 'entries/form',

  didInsertElement: function(){
    this.$('textarea').focus();
  }
});