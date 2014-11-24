import Ember from "ember";

export default Ember.Component.extend({
  classNames: ['calendar-date-picker'],
  _picker: null,
  defaultDate: new Date(),
  attributeBindings: ['readonly'],
  readonly: true,
  value: "",
 
  actions: {
    togglePicker: function() {
      var picker = this.get('_picker');
      if (picker.isVisible()) {
        picker.hide();
      } else {
        picker.show();
      }
    }
  },

  modelChangedValue: function(){
    var picker = this.get("_picker");
    if (picker){
      picker.setDate(this.get("value"));
    }    
  }.observes("value"),
 
  didInsertElement: function(){
    var defaultDate = moment(this.get('defaultDate'));
    this.set('value', defaultDate.format('MMMM Do, YYYY'));
    var currentYear = (new Date()).getFullYear();

    var picker = new Pikaday({ 
      field: this.$('input').get(0),
      yearRange: [2005, currentYear],
      defaultDate: defaultDate.toDate(),
      setDefaultDate: defaultDate.toDate(),
      maxDate: new Date(),
      format: 'MMMM Do, YYYY'
    });

    this.set("_picker", picker);
  },
 
  willDestroyElement: function(){
    var picker = this.get("_picker");
    if (picker) {
      picker.destroy();
    }
    this.set("_picker", null);
  }
});