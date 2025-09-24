"use client";

import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, getDocs, collection, query, where, limit } from "firebase/firestore";
import { auth, db, userConverter } from "@/lib/firestore";
import type { AppUser, Role } from "@/types";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  role: Role | null;
  handleSignUp: (data: any) => Promise<string | null>;
  handleSignIn: (email: string, pass: string) => Promise<string | null>;
  handleSignOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid).withConverter(userConverter);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser(userData);
          setRole(userData.role);
          if (userData.role !== 'pending' && userData.role !== 'rejected') {
            const currentPath = window.location.pathname;
            if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/') {
                router.replace("/admin/dashboard");
            }
          } else {
             router.replace("/login?pending=1");
          }
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignUp = async (data: any) => {
    setLoading(true);
    try {
      const { email, password, fullName, phone, company, companyId, workLocation } = data;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const metaRef = doc(db, "app", "config");
      const metaSnap = await getDoc(metaRef);
      const isOwner = !metaSnap.exists() || metaSnap.data().ownerSet !== true;
      const newUserRole = isOwner ? 'owner' : 'pending';

      const userProfile: Omit<AppUser, 'uid'> = {
        email,
        fullName,
        phone: phone || "",
        company: company || "",
        companyId: companyId || "",
        workLocation: workLocation || "",
        role: newUserRole,
        createdAt: serverTimestamp(),
        approvedBy: null,
        approvedAt: null,
      };

      await setDoc(doc(db, "users", uid), userProfile);
      
      if (isOwner) {
        await setDoc(metaRef, { ownerSet: true }, { merge: true });
      }
      
      if (newUserRole === 'pending') {
          await signOut(auth);
          router.push("/login?pending=1");
      } else {
        setUser({ uid, ...userProfile } as AppUser);
        setRole(newUserRole);
      }
      
      return null;
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === 'auth/email-already-in-use') {
        return 'An account with this email already exists. Please try logging in or use the reset script if this is a development environment.';
      }
      return error.message || "An unknown error occurred.";
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;

      const userRef = doc(db, "users", uid).withConverter(userConverter);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await signOut(auth);
        throw new Error("No user profile found. Contact admin.");
      }

      const profile = snap.data();

      if (profile.role === "pending") {
        await signOut(auth);
        router.push("/login?pending=1");
        return "Your account is awaiting approval.";
      }

      if (profile.role === "rejected") {
        await signOut(auth);
        throw new Error("Your account has been rejected.");
      }
      return null;
    } catch (error: any) {
      console.error("Signin error:", error);
      setLoading(false);
      return error.message || "An unknown error occurred.";
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setRole(null);
    router.push("/login");
    setLoading(false);
  };

  const value = { user, loading, role, handleSignUp, handleSignIn, handleSignOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
