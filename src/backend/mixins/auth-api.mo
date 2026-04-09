import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

mixin (
  accessControlState : AccessControl.AccessControlState,
) {
  // Returns the caller's Principal — useful for debugging and verifying the logged-in identity
  public query ({ caller }) func whoami() : async Principal {
    caller;
  };
};
