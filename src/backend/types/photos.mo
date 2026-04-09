module {
  public type StagePhoto = {
    id : Text;
    stageId : Nat;
    description : Text;
    timestamp : Int;
    blobHash : Text;
    distanceKm : ?Float;
  };
};
