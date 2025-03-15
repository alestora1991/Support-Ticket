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

// Define all functions outside the component
function checkSession() {
  return supabase.auth.getSession().then(({ data: { session } }) => {
    return session?.user ?? null;
  });
}

async function signInUser(email: string, password: string, rememberMe = false) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      // Always persist the session, we'll handle the remember me logic ourselves
      persistSession: true,
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
}

async function signUpUser(email: string, password: string, fullName: string) {
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
}

async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  // Clear persistence settings
  localStorage.removeItem("auth_persistence");
  sessionStorage.removeItem("session_active");
}

function checkSessionPersistence(
  user: User | null,
  signOut: () => Promise<void>,
) {
  const persistenceType = localStorage.getItem("auth_persistence");
  const sessionActive = sessionStorage.getItem("session_active");

  // If user chose not to be remembered and this is a new browser session
  if (persistenceType === "session" && !sessionActive && user) {
    // This is a new browser session, sign the user out
    signOut();
  }
}

// Export the provider component as a named function
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth state change listener
  useEffect(() => {
    // Check active sessions and sets the user
    checkSession().then((user) => {
      setUser(user);
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

  // Sign in function wrapper
  async function signIn(email: string, password: string, rememberMe = false) {
    await signInUser(email, password, rememberMe);
  }

  // Sign up function wrapper
  async function signUp(email: string, password: string, fullName: string) {
    await signUpUser(email, password, fullName);
  }

  // Sign out function wrapper
  async function signOut() {
    await signOutUser();
  }

  // Session persistence check function
  useEffect(() => {
    if (!loading) {
      checkSessionPersistence(user, signOut);
    }

    // Mark this browser session
    if (user) {
      sessionStorage.setItem("session_active", "true");
    }

    // Also check when the window gains focus (in case of browser restart)
    const handleFocus = () => checkSessionPersistence(user, signOut);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Export the hook as a named function
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
