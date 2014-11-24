import Ember from "ember";
import DS from "ember-data";
import ENV from 'dayjot/config/environment';
 
export default DS.RESTAdapter.extend({
  host: ENV.APP.API_HOST,

  /**
    The ActiveModelAdapter overrides the `ajaxError` method
    to return a DS.InvalidError for all 422 Unprocessable Entity
    responses.

    A 422 HTTP response from the server generally implies that the request
    was well formed but the API was unable to process it because the
    content was not semantically correct or meaningful per the API.

    For more information on 422 HTTP Error code see 11.2 WebDAV RFC 4918
    https://tools.ietf.org/html/rfc4918#section-11.2

    @method ajaxError
    @param jqXHR
    @return error
  */
  ajaxError: function(jqXHR) {
    var error = this._super(jqXHR);

    if (jqXHR && jqXHR.status === 422) {
      var response = Ember.$.parseJSON(jqXHR.responseText),
          errors = {};

      if (response.errors !== undefined) {
        errors = response.errors;        
      }
      return new DS.InvalidError(errors);
    } else if (jqXHR && jqXHR.status === 401) {
      return new DS.InvalidError({});
    } else {
      return error;
    }
  }
});