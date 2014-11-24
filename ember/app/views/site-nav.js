import Ember from "ember";

export default Ember.View.extend({
  templateName: 'site-nav',  
  tagName: 'nav',
  classNames: ['navbar','navbar-default'],

  todayDate: moment().format('YYYY-MM-DD'),
  searchTerm: "",

  actions: {
    search: function() {
      this.get('controller').send('search', this.get('searchTerm'));
    },
    toggleDropdown: function() {
      var target = this.$('.dropdown-toggle'),
          parent = target.parents('li:first');

      parent.toggleClass('open');
    }
  },

  didInsertElement: function() {
    $('body').on('click', function(e) {
      if (!$(e.target).hasClass('dropdown-toggle')) {
        $('.dropdown-toggle').parents('li:first').removeClass('open');
      }
    });
  }
  
});