import AccessControl "mo:caffeineai-authorization/access-control";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import PhotoLib "../lib/photos";
import Types "../types/photos";

mixin (
  accessControlState : AccessControl.AccessControlState,
  photoStore : PhotoLib.PhotoStore,
  photoCounter : PhotoLib.PhotoCounterState,
) {
  // Upload a photo for a stage — admin only.
  // The blobHash is the hash returned by _immutableObjectStorageCreateCertificate.
  public shared ({ caller }) func uploadStagePhoto(
    stageId : Nat,
    description : Text,
    blobHash : Text,
    distanceKm : ?Float,
  ) : async { #ok : Types.StagePhoto; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: admin login required");
    };
    if (stageId < 1 or stageId > 12) {
      return #err("Invalid stageId: must be between 1 and 12");
    };
    let photo = PhotoLib.add(photoStore, photoCounter, stageId, description, blobHash, distanceKm);
    #ok(photo);
  };

  // Get all photos for a stage — public, no auth required.
  public query func getStagePhotos(stageId : Nat) : async [Types.StagePhoto] {
    PhotoLib.getByStage(photoStore, stageId);
  };

  // Delete a photo by ID — admin only.
  public shared ({ caller }) func deleteStagePhoto(photoId : Text) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: admin login required");
    };
    if (PhotoLib.remove(photoStore, photoId)) {
      #ok;
    } else {
      #err("Photo not found: " # photoId);
    };
  };
};
