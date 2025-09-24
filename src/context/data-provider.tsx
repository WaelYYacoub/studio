"use client";

import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
  useCallback,
} from "react";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
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

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const passesQuery = query(collection(db, "passes"), orderBy("createdAt", "desc")).withConverter(passConverter);
      const passesSnapshot = await getDocs(passesQuery);
      const passesData = passesSnapshot.docs.map(doc => doc.data());
      setPasses(passesData);

      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc")).withConverter(userConverter);
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => doc.data());
      setUsers(usersData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      // Clear data on logout
      setPasses([]);
      setUsers([]);
      setLoading(false);
    }
  }, [user, fetchData]);

  const refreshData = () => {
    fetchData();
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
