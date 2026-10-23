import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "../firebase/firebaseConfig";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configurationError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configurationError, setConfigurationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    try {
      return onAuthStateChanged(
        getFirebaseAuth(),
        (nextUser) => {
          setUser(nextUser);
          setLoading(false);
        },
        () => {
          setUser(null);
          setLoading(false);
        }
      );
    } catch (error) {
      setConfigurationError(
        error instanceof Error
          ? error.message
          : "Firebase authentication is not configured."
      );
      setLoading(false);
      return undefined;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configurationError,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password
        );
      },
      signOut: async () => {
        await firebaseSignOut(getFirebaseAuth());
      },
    }),
    [user, loading, configurationError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
