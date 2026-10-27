export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  isPromoter: boolean;
  hasCompletedOnboarding: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
