import Ember from "ember";

export default Ember.TextArea.extend({
  typing: false,
  fade: false,

  didInsertElement: function() {
    this.$().autosize();
    var _this = this;
    $(document).on('mousemove tap click', function() {
      if (_this.get('typing')) {
        _this.set('typing', false);
        if(_this.get('fade')) {
          $('.d-when,.btn,.navbar').removeClass('fadeout');
        }        
      }
    });
    this.$().on('blur', function() {
      if (_this.get('typing')) {
        _this.set('typing', false);
        if(_this.get('fade')) {
          $('.d-when,.btn,.navbar').removeClass('fadeout');
        }        
      }
    });
  },
 
  willDestroyElement: function(){
    this.$().trigger('autosize.destroy');
    $(document).unbind("mousemove tap click");
    this.$().unbind('blur');
  },

  keyPress: function() {
    if (!this.get('typing')) {
      this.set('typing', true);
      $('.d-error-box').remove();
      if(this.get('fade')) {
        $('.d-when,.btn,.navbar').addClass('fadeout');
      }
    }
  }
});