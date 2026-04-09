module {
  // Re-export UserRole for use across the app
  public type UserRole = {
    #admin;
    #user;
    #guest;
  };
};
