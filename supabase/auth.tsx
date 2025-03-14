import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (
    email: string,
    password: string,
    rememberMe = false,
  ) => {
    // Set the session persistence based on the rememberMe flag
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // When rememberMe is true, session persists after browser close
        // When false, session is cleared when browser is closed
        persistSession: rememberMe,
      },
    });

    if (error) throw error;

    // Store the user's preference for session persistence
    if (rememberMe) {
      localStorage.setItem("auth_persistence", "persistent");
    } else {
      localStorage.setItem("auth_persistence", "session");
      // Set a flag in sessionStorage to detect browser restarts
      sessionStorage.setItem("session_active", "true");
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear persistence settings
    localStorage.removeItem("auth_persistence");
    sessionStorage.removeItem("session_active");
  };

  // Check on initial load if we should clear the session
  useEffect(() => {
    const checkSessionPersistence = () => {
      const persistenceType = localStorage.getItem("auth_persistence");
      const sessionActive = sessionStorage.getItem("session_active");

      // If user chose not to be remembered and this is a new browser session
      if (persistenceType === "session" && !sessionActive && user) {
        // This is a new browser session, sign the user out
        signOut();
      }
    };

    if (!loading) {
      checkSessionPersistence();
    }

    // Mark this browser session
    if (user) {
      sessionStorage.setItem("session_active", "true");
    }

    // Also check when the window gains focus (in case of browser restart)
    window.addEventListener("focus", checkSessionPersistence);
    return () => window.removeEventListener("focus", checkSessionPersistence);
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
