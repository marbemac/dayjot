import Ember from "ember";

export default Ember.View.extend({
  templateName: 'entries/list',

  actions: {
    loadMore: function() {
      this.get('controller').loadMore();      
    }
  },

  // this is called every time we scroll
  didScroll: function(){
    if (this.isScrolledToBottom()) {
      this.get('controller').loadMore();
    }
  },
   
  // we check if we are at the bottom of the page
  isScrolledToBottom: function(){
    var distanceToViewportTop = (
      $(document).height() - $(window).height());
    var viewPortTop = $(document).scrollTop();
   
    if (viewPortTop === 0) {
      // if we are at the top of the page, don't do
      // the infinite scroll thing
      return false;
    }
   
    return (viewPortTop - distanceToViewportTop === 0);
  },

  didInsertElement: function(){
    // we want to make sure 'this' inside `didScroll` refers
    // to the IndexView, so we use jquery's `proxy` method to bind it
    $(window).on('scroll', $.proxy(this.didScroll, this));
  },
  willDestroyElement: function(){
    // have to use the same argument to `off` that we did to `on`
    $(window).off('scroll', $.proxy(this.didScroll, this));
  }
});