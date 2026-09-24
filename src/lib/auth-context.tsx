"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

export type AuthView = "login" | "register" | "verify";

interface AuthContextValue {
  ready: boolean;
  configured: boolean;
  firebaseUser: FirebaseUser | null;
  emailVerified: boolean;
  authError: string | null;
  authBusy: boolean;
  clearAuthError: () => void;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  reloadUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: string }).code)
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado. Inicia sesión o usa otro correo.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
    case "auth/network-request-failed":
      return "Error de red. Revisa tu conexión.";
    default:
      return "No se pudo completar la operación. Inténtalo de nuevo.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }

    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setReady(true);
    });
    return () => unsub();
  }, [configured]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const register = useCallback(
    async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      if (!configured) {
        setAuthError("Firebase no está configurado en este entorno.");
        return;
      }
      setAuthBusy(true);
      setAuthError(null);
      try {
        const auth = getFirebaseAuth();
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
        await sendEmailVerification(cred.user);
        await cred.user.reload();
        setFirebaseUser(auth.currentUser);
      } catch (error) {
        setAuthError(mapAuthError(error));
        throw error;
      } finally {
        setAuthBusy(false);
      }
    },
    [configured],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      if (!configured) {
        setAuthError("Firebase no está configurado en este entorno.");
        return;
      }
      setAuthBusy(true);
      setAuthError(null);
      try {
        const auth = getFirebaseAuth();
        const cred = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        await cred.user.reload();
        setFirebaseUser(auth.currentUser);
} catch (error: any) {

  console.error("🔥 ERROR FIREBASE");
  console.error(error);
  console.error("CODIGO:", error.code);
  console.error("MENSAJE:", error.message);

  setAuthError(
    error.code + " - " + error.message
  );

  throw error;
}finally {
        setAuthBusy(false);
      }
    },
    [configured],
  );

  const logout = useCallback(async () => {
    if (!configured) return;
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signOut(getFirebaseAuth());
      setFirebaseUser(null);
    } catch (error) {
      setAuthError(mapAuthError(error));
    } finally {
      setAuthBusy(false);
    }
  }, [configured]);

  const resendVerification = useCallback(async () => {
    if (!firebaseUser) return;
    setAuthBusy(true);
    setAuthError(null);
    try {
      await sendEmailVerification(firebaseUser);
    } catch (error) {
      setAuthError(mapAuthError(error));
      throw error;
    } finally {
      setAuthBusy(false);
    }
  }, [firebaseUser]);

  const reloadUser = useCallback(async () => {
    if (!firebaseUser) return false;
    setAuthBusy(true);
    setAuthError(null);
    try {
      await firebaseUser.reload();
      const auth = getFirebaseAuth();
      setFirebaseUser(auth.currentUser);
      return Boolean(auth.currentUser?.emailVerified);
    } catch (error) {
      setAuthError(mapAuthError(error));
      return false;
    } finally {
      setAuthBusy(false);
    }
  }, [firebaseUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured,
      firebaseUser,
      emailVerified: Boolean(firebaseUser?.emailVerified),
      authError,
      authBusy,
      clearAuthError,
      register,
      login,
      logout,
      resendVerification,
      reloadUser,
    }),
    [
      ready,
      configured,
      firebaseUser,
      authError,
      authBusy,
      clearAuthError,
      register,
      login,
      logout,
      resendVerification,
      reloadUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}