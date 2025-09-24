"use client";

import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
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

  const fetchData = () => {
    setLoading(true);

    const passesQuery = query(collection(db, "passes"), orderBy("createdAt", "desc")).withConverter(passConverter);
    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc")).withConverter(userConverter);

    const passesUnsubscribe = onSnapshot(passesQuery, (snapshot) => {
      const passesData = snapshot.docs.map(doc => doc.data());
      setPasses(passesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching passes:", error);
      setLoading(false);
    });

    const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data());
      setUsers(usersData);
    }, (error) => {
      console.error("Error fetching users:", error);
    });

    return () => {
      passesUnsubscribe();
      usersUnsubscribe();
    };
  };

  useEffect(() => {
    if (user) { // Only fetch data if user is logged in
      const unsubscribe = fetchData();
      return unsubscribe;
    } else {
      setPasses([]);
      setUsers([]);
      setLoading(false);
    }
  }, [user]);

  const refreshData = () => {
      // This function can be called to manually re-trigger fetches if needed,
      // but onSnapshot should handle most updates automatically.
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
