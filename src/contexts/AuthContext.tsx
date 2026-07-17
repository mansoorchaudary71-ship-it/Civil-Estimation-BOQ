import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { initAuth, googleSignIn, logoutGoogle } from "../lib/firebase";

// Mimic the Firebase User shape minimally to satisfy existing components
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  workspaceToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateUserDisplayName: (name: string) => Promise<void>;
  updateUserProfilePhoto: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceToken, setWorkspaceToken] = useState<string | null>(null);

  useEffect(() => {
    // Check traditional JWT
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser({
              uid: data.user.id,
              email: data.user.email,
              displayName: data.user.name,
              photoURL: ''
            });
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (err) {
          console.error("Error fetching auth state", err);
        }
      }
      setLoading(false);
    };
    checkAuth();

    // Init Firebase Auth for Google Workspace
    const unsubscribe = initAuth(
      (fbUser, token) => {
        setWorkspaceToken(token);
        // If not already logged in via JWT, set user
        setUser(prev => prev || {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || '',
          photoURL: fbUser.photoURL || ''
        });
        setLoading(false);
      },
      () => {
        setWorkspaceToken(null);
      }
    );
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setWorkspaceToken(result.accessToken);
        setUser({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || ''
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in with Google.");
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login');
    }
    localStorage.setItem('auth_token', data.token);
    setUser({
      uid: data.user.id,
      email: data.user.email,
      displayName: data.user.name,
      photoURL: ''
    });
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, name })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register');
    }
    localStorage.setItem('auth_token', data.token);
    setUser({
      uid: data.user.id,
      email: data.user.email,
      displayName: data.user.name,
      photoURL: ''
    });
  };

  const logOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('auth_token');
    await logoutGoogle();
    setUser(null);
    setWorkspaceToken(null);
  };

  const updateUserDisplayName = async (name: string) => {
    if (user) {
      setUser({ ...user, displayName: name });
      // In a real app, send this to the backend
    }
  };

  const updateUserProfilePhoto = async (url: string) => {
    if (user) {
      setUser({ ...user, photoURL: url });
      // In a real app, send this to the backend
    }
  };

  return (
    <AuthContext.Provider value={{
      user, 
      loading, 
      workspaceToken,
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      logOut,
      updateUserDisplayName,
      updateUserProfilePhoto
    }}>
      {!loading ? children : <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-slate-800"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}
    </AuthContext.Provider>
  );
};
