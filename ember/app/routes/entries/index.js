import PlanRequiredRoute from "dayjot/routes/plan-required";

export default PlanRequiredRoute.extend({

  queryParams: {
    search: {
      refreshModel: true
    },
    when: {
      refreshModel: true
    }
  },

  search: "",
  when: "",

  model: function(params, data) {
    return this.store.find('entry', data.queryParams);      
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.reset();    
  },

  actions: {
    loadMore: function() {
      var controller = this.get('controller'),
        nextPage = controller.get('page') + 1,
        search = controller.get('search'),
        when = controller.get('when');

      this.store.find('entry', {search: search, when: when, page: nextPage}).then(function(entries) {
        controller.loadedMore(entries, nextPage);
      });
    }
  }

});
  