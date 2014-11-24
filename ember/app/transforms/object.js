import Ember from "ember";
import DS from "ember-data";

export default DS.Transform.extend({
  deserialize: function(serialized) {
    if (Ember.typeOf(serialized) === "string") {
      return JSON.parse(serialized);
    } else if (serialized) {
      return serialized;
    } else {
      return {};
    }
  },

  serialize: function(deserialized) {
    var type = Ember.typeOf(deserialized);
    if (type === 'object') {
        return deserialized;
    } else {
        return {};
    }
  }
});