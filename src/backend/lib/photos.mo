import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/photos";

module {
  public type PhotoStore = Map.Map<Text, Types.StagePhoto>;
  public type PhotoCounterState = { var nextId : Nat };

  public func newStore() : PhotoStore {
    Map.empty<Text, Types.StagePhoto>();
  };

  public func newCounterState() : PhotoCounterState {
    { var nextId = 0 };
  };

  public func add(
    store : PhotoStore,
    counter : PhotoCounterState,
    stageId : Nat,
    description : Text,
    blobHash : Text,
    distanceKm : ?Float,
  ) : Types.StagePhoto {
    let desc = if (description.size() > 200) {
      Text.fromIter(description.toIter().take(200));
    } else {
      description;
    };
    let id = "photo-" # counter.nextId.toText();
    counter.nextId += 1;
    let photo : Types.StagePhoto = {
      id;
      stageId;
      description = desc;
      timestamp = Time.now();
      blobHash;
      distanceKm;
    };
    store.add(id, photo);
    photo;
  };

  public func getByStage(store : PhotoStore, stageId : Nat) : [Types.StagePhoto] {
    store.values().filter(func(p) { p.stageId == stageId }).toArray();
  };

  public func remove(store : PhotoStore, photoId : Text) : Bool {
    let exists = store.get(photoId) != null;
    if (exists) { store.remove(photoId) };
    exists;
  };
};
