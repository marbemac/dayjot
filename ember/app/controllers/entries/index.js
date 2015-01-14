import Ember from "ember";

export default Ember.ArrayController.extend({
  itemController: 'entries.show',
  sortProperties: ['timestamp'],
  sortAscending: false,

  // Filtering
  queryParams: ['when','search'],
  when: "",
  search: "",
  
  // Pagination
  page: 1,
  perPage: 10,
  loadingMore: false,
  endOfList: false,

  lengthOrSearching: function() {
    return this.get('search').length || this.get('content').content.length > 0 ? true : false;
  }.property('content.length', 'search'),

  loadMore: function() {
    // don't load new data if we already are
    if (this.get('loadingMore') || this.get('endOfList')) {
      return;
    }
   
    this.set('loadingMore', true);
   
    // pass this action up the chain to the events hash on the route
    this.get('target').send('loadMore');
  },

  loadedMore: function(entries, page) {
    this.set('page', page);   
    this.get('content').pushObjects(entries.content);
    this.set('loadingMore', false);
    if (entries.content.length < this.get('perPage')) {
      this.set('endOfList', true);
    }
  },

  reset: function() {
    this.setProperties({
      page: 1,
      loadingMore: false      
    });

    if (this.get('content').length < this.get('perPage')) {
      this.set('endOfList', true);
    } else {
      this.set('endOfList', false);
    }
  }
});  