import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { auth } from '../config/firebase';
import type { UserProfile } from '../domain/schema';
import { isProfileComplete, subscribeProfile } from '../services/users';

type AuthState = {
  user: User | null;
  /** undefined = cargando; null = no existe en la base de datos */
  profile: Partial<UserProfile> | null | undefined;
  initializing: boolean;
  profileComplete: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, profile: undefined, initializing: true, profileComplete: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [initializing, setInitializing] = useState(true);
  // Perfil asociado al uid que lo cargó, para no mostrar el de una sesión anterior.
  const [loaded, setLoaded] = useState<{ uid: string; profile: Partial<UserProfile> | null } | null>(null);
  const profile = user && loaded?.uid === user.uid ? loaded.profile : undefined;

  // La sesión se mantiene entre aperturas (la app Java cerraba sesión en cada onStart).
  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setInitializing(false);
      }),
    [],
  );

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    // Si falla la lectura no se rompe la app (la app Java lanzaba excepciones a propósito).
    return subscribeProfile(
      uid,
      (p) => setLoaded({ uid, profile: p }),
      () => setLoaded({ uid, profile: null }),
    );
  }, [user]);

  const value = useMemo(
    () => ({ user, profile, initializing, profileComplete: isProfileComplete(profile) }),
    [user, profile, initializing],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
