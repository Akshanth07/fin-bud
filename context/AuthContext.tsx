"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { UserProfile, AuthState } from "@/types/auth";

interface AuthContextType extends AuthState {
  signUp: (fullName: string, email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  forgotPassword: (email: string) => Promise<{ error: Error | null }>;
  resetPassword: (password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthCookies = (session: Session | null) => {
  if (typeof document === "undefined") return;

  if (session?.access_token) {
    const maxAge = session.expires_in || 3600 * 24 * 7;
    document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } else {
    document.cookie = "sb-access-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string, userEmail: string, fullNameFromMeta?: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.warn("Could not fetch profile from users table:", profileError.message);
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        setProfile({
          id: userId,
          email: userEmail,
          full_name: fullNameFromMeta || userEmail.split("@")[0],
          avatar_url: null,
        });
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      setProfile({
        id: userId,
        email: userEmail,
        full_name: fullNameFromMeta || userEmail.split("@")[0],
        avatar_url: null,
      });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, user.email || "", user.user_metadata?.full_name);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          setAuthCookies(currentSession);
          // Asynchronously fetch profile without blocking isLoading
          fetchProfile(
            currentSession.user.id,
            currentSession.user.email || "",
            currentSession.user.user_metadata?.full_name
          ).catch((e) => console.warn("Background fetchProfile notice:", e));
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setAuthCookies(null);
        }
      } catch (err: any) {
        console.error("Auth init failed:", err);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setAuthCookies(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        setAuthCookies(newSession);
        fetchProfile(
          newSession.user.id,
          newSession.user.email || "",
          newSession.user.user_metadata?.full_name
        ).catch((e) => console.warn("Background fetchProfile notice:", e));
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setAuthCookies(null);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        try {
          await supabase.from("users").upsert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn("Notice: Record creation in 'users' table encountered issue:", dbErr);
        }

        setUser(data.user);
        setSession(data.session);
        setAuthCookies(data.session);
        setProfile({
          id: data.user.id,
          full_name: fullName,
          email: email,
        });
      }

      setIsLoading(false);
      return { user: data.user, error: null };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthCookies(null);
      const errorMessage = err.message || "Failed to create account.";
      setError(errorMessage);
      setIsLoading(false);
      return { user: null, error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.user || !data.session) {
        throw new Error("Invalid login credentials.");
      }

      setSession(data.session);
      setUser(data.user);
      setAuthCookies(data.session);

      fetchProfile(
        data.user.id,
        data.user.email || "",
        data.user.user_metadata?.full_name
      ).catch((e) => console.warn("Background fetchProfile notice:", e));

      setIsLoading(false);
      return { user: data.user, error: null };
    } catch (err: any) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthCookies(null);
      const errorMessage = err.message || "Invalid credentials.";
      setError(errorMessage);
      setIsLoading(false);
      return { user: null, error: err };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthCookies(null);
      if (typeof window !== "undefined") {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {}
      }
      await supabase.auth.signOut();
    } catch (err: any) {
      console.warn("Notice during Supabase signout:", err);
    } finally {
      setIsLoading(false);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return { error: null };
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (resetError) throw resetError;
      return { error: null };
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
      return { error: err };
    }
  };

  const resetPassword = async (password: string) => {
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      return { error: null };
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        error,
        signUp,
        signIn,
        signOut,
        forgotPassword,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useCurrentUser() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within an AuthProvider");
  }
  return {
    user: context.user,
    profile: context.profile,
    isLoading: context.isLoading,
  };
}
