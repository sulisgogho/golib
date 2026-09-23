"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { googleProvider } from "@/lib/firebase";

export interface UserData {
  displayName: string;
  email: string;
  photoURL: string;
  lastLoginAt: string;
  createdAt: string;
  isApproved: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  canRead: boolean;
  trialDaysLeft: number;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const ADMIN_EMAILS = ["sulisgogho@gmail.com"];

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  canRead: false,
  trialDaysLeft: 0,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [canRead, setCanRead] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Save or update user data in Firestore
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);
          
          let initialData: any = {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            lastLoginAt: new Date().toISOString(),
          };

          if (!snap.exists()) {
            initialData.createdAt = new Date().toISOString();
            initialData.isApproved = false;
          }
          await setDoc(userRef, initialData, { merge: true });

          unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserData;
              setUserData(data);
              
              const adminStatus = ADMIN_EMAILS.includes(data.email || "");
              
              if (adminStatus || data.isApproved) {
                setCanRead(true);
                setTrialDaysLeft(0);
              } else {
                const created = new Date(data.createdAt || initialData.createdAt).getTime();
                const now = new Date().getTime();
                const diffDays = (now - created) / (1000 * 3600 * 24);
                
                if (diffDays <= 7) {
                  setCanRead(true);
                  setTrialDaysLeft(Math.max(0, Math.ceil(7 - diffDays)));
                } else {
                  setCanRead(false);
                  setTrialDaysLeft(0);
                }
              }
            }
            setLoading(false);
          });
        } catch (error) {
          console.error("Error saving user data:", error);
          setLoading(false);
        }
      } else {
        setUserData(null);
        setCanRead(false);
        setTrialDaysLeft(0);
        setLoading(false);
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  const isAdmin = user ? ADMIN_EMAILS.includes(user.email || "") : false;

  return (
    <AuthContext.Provider value={{ user, userData, canRead, trialDaysLeft, loading, isAdmin, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
