"use client";

import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
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

    // Real-time listener for passes
    const passesQuery = query(
      collection(db, "passes"),
      orderBy("createdAt", "desc")
    ).withConverter(passConverter);

    const unsubscribePasses = onSnapshot(
      passesQuery,
      (snapshot) => {
        const passesData = snapshot.docs.map((doc) => doc.data());
        setPasses(passesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching passes:", error);
        setLoading(false);
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
        console.error("Error fetching users:", error);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribePasses();
      unsubscribeUsers();
    };
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