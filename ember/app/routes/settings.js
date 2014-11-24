import ProtectedRoute from "./protected";
import ResetScroll from "dayjot/mixins/reset-scroll";

export default ProtectedRoute.extend(ResetScroll, {
  setupController: function(controller) {
    controller.set('model', this.get('session.currentUser'));
  }
});
  