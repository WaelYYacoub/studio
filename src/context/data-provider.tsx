"use client";
import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from "react";
import { collection, query, orderBy, onSnapshot, writeBatch, doc } from "firebase/firestore";
import { db, passConverter, userConverter } from "@/lib/firestore";
import type { AppUser, Pass } from "@/types";
import { useAuth } from "@/hooks/use-auth";

interface DataContextType {
  passes: Pass[];
  users: AppUser[];
  loading: boolean;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [passes, setPasses] = useState<Pass[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPasses([]);
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // ✅ Wrap Firestore listeners in try-catch
      // Real-time listener for passes
      const passesQuery = query(
        collection(db, "passes"),
        orderBy("createdAt", "desc")
      ).withConverter(passConverter);

      const unsubscribePasses = onSnapshot(
        passesQuery,
        async (snapshot) => {
          const passesData = snapshot.docs.map((doc) => doc.data());
          
          // Update expired passes in Firestore (background operation)
          const now = new Date();
          const batch = writeBatch(db);
          let updateCount = 0;
          
          snapshot.docs.forEach((docSnap) => {
            const pass = docSnap.data();
            // Check if pass is active but expired
            if (pass.status === "active" && pass.expiresAt.toDate() < now) {
              const passRef = doc(db, "passes", pass.id);
              batch.update(passRef, { status: "expired" });
              updateCount++;
            }
          });
          
          // Commit batch if there are updates
          if (updateCount > 0) {
            try {
              await batch.commit();
              console.log(\Auto-updated \ expired pass(es) in Firestore\);
            } catch (error) {
              console.error("Failed to update expired passes:", error);
            }
          }
          
          setPasses(passesData);
          setLoading(false);
        },
        (error) => {
          // ✅ Handle offline error gracefully
          console.log('[Data] Offline or error fetching passes:', error.message);
          setLoading(false);
          // Keep existing cached passes if any
        }
      );

      // Real-time listener for users
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
      ).withConverter(userConverter);

      const unsubscribeUsers = onSnapshot(
        usersQuery,
        (snapshot) => {
          const usersData = snapshot.docs.map((doc) => doc.data());
          setUsers(usersData);
        },
        (error) => {
          // ✅ Handle offline error gracefully
          console.log('[Data] Offline or error fetching users:', error.message);
          // Keep existing cached users if any
        }
      );

      // Cleanup listeners on unmount
      return () => {
        unsubscribePasses();
        unsubscribeUsers();
      };
    } catch (error: any) {
      // ✅ Catch any synchronous errors setting up listeners
      console.log('[Data] Error setting up Firestore listeners (offline):', error.message);
      setLoading(false);
    }
  }, [user]);

  const refreshData = () => {
    console.log("Data is real-time, no manual refresh needed");
  };

  const value = { passes, users, loading, refreshData };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};