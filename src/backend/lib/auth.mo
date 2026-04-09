import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/auth";

module {
  public func isAdmin(state : AccessControl.AccessControlState, caller : Principal) : Bool {
    AccessControl.isAdmin(state, caller);
  };

  public func getRole(state : AccessControl.AccessControlState, caller : Principal) : Types.UserRole {
    AccessControl.getUserRole(state, caller);
  };
};
