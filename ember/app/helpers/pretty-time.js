import Ember from "ember";
 
export default Ember.Handlebars.makeBoundHelper(function(time) {
  if (!time) {
    return "";
  }

  if (time.iso) {
    return moment(time.iso).utc().format("MMMM Do, YYYY");
  } else {
    return moment(time).utc().format("MMMM Do, YYYY");
  }
});