import Ember from "ember";
 
export default Ember.Handlebars.makeBoundHelper(function(time) {
  return moment(time, "YYYY-M").utc().format("MMMM YYYY");
});