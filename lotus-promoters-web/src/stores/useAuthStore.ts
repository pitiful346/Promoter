import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type Unsubscribe,
} from "firebase/auth";

import { auth } from "@/infrastructure/firebase/firebaseConfig";
import { AuthUser } from "@/core/domain/auth";

interface AuthStoreState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  authUnsubscribe: Unsubscribe | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  authUnsubscribe: null,

  initAuth: () => {
    // Avoid duplicate listeners
    const existing = get().authUnsubscribe;
    if (existing) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Promoter",
          photoUrl: firebaseUser.photoURL || undefined,
          isPromoter: true,
          // Mark onboarding complete if user already has a displayName set
          hasCompletedOnboarding: !!firebaseUser.displayName,
        };
        set({ user, isAuthenticated: true, isInitializing: false });
      } else {
        set({ user: null, isAuthenticated: false, isInitializing: false });
      }
    });

    set({ authUnsubscribe: unsubscribe });
  },

  login: async (email: string, pass: string) => {
    set({ isLoading: true });
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will update the store automatically
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (name: string, email: string, pass: string) => {
    set({ isLoading: true });
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(credential.user, { displayName: name });
      // onAuthStateChanged will update the store automatically
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await signOut(auth);
    // onAuthStateChanged will set user to null automatically
  },

  completeOnboarding: () => {
    set((state) => ({
      user: state.user ? { ...state.user, hasCompletedOnboarding: true } : null,
    }));
  },
}));

