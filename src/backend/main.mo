import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import AuthMixin "mixins/auth-api";
import PhotosMixin "mixins/photos-api";
import PhotoLib "lib/photos";



actor {
  let accessControlState = AccessControl.initState();
  let photoStore = PhotoLib.newStore();
  let photoCounter = PhotoLib.newCounterState();

  include MixinAuthorization(accessControlState);
  include MixinObjectStorage();
  include AuthMixin(accessControlState);
  include PhotosMixin(accessControlState, photoStore, photoCounter);
};
