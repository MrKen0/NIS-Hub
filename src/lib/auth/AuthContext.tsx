"use client";

/**
 * Auth Context — provides the current user state to the entire app
 * -----------------------------------------------------------------
 * Wrap your app with <AuthProvider> and use the useAuth() hook anywhere
 * to get the current Firebase user, their Firestore profile, and loading state.
 *
 * Usage:
 *   const { user, profile, loading } = useAuth();
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { getUserProfile } from "@/services/userProfile";
import type { UserProfile } from "@/types/user";

// Shape of what the context provides
interface AuthContextValue {
  // The raw Firebase Auth user (null if signed out)
  user: User | null;
  // The Firestore member profile (null if signed out or not yet onboarded)
  profile: UserProfile | null;
  // True while we're checking auth state on page load
  loading: boolean;
  // Call this to re-fetch the profile (e.g. after onboarding)
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

// Hook to access auth state from any component
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component — wraps the app in layout.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or re-fetch the Firestore profile for the current user
  async function refreshProfile() {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await getUserProfile(user.uid);
    setProfile(p);
  }

  // Listen for auth state changes (sign in, sign out, page reload)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // User is signed in — try to load their profile
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        // User is signed out
        setProfile(null);
      }

      setLoading(false);
    });

    // Clean up listener when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
