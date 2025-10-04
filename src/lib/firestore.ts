import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp, Timestamp, type DocumentData, type FirestoreDataConverter, type QueryDocumentSnapshot, type SnapshotOptions } from "firebase/firestore";
import type { AppUser, Pass, Role } from "@/types";

const firebaseConfig = {
  apiKey: "AIzaSyDzcqs6xqG9yoz6gIjStQLQOX7K00gG41E",
  authDomain: "guardian-e6f28.firebaseapp.com",
  projectId: "guardian-e6f28",
  storageBucket: "guardian-e6f28.firebasestorage.app",
  messagingSenderId: "820767061705",
  appId: "1:820767061705:web:fb36dd35ae9e53df25ff18",
  measurementId: "G-VZSVZKZE0K"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ts = serverTimestamp;

export const userConverter: FirestoreDataConverter<AppUser> = {
  toFirestore: (user: AppUser): DocumentData => {
    return { ...user };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): AppUser => {
    const data = snapshot.data(options);
    return {
      uid: snapshot.id,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      company: data.company,
      companyId: data.companyId,
      workLocation: data.workLocation,
      role: data.role as Role,
      createdAt: data.createdAt,
      approvedBy: data.approvedBy,
      approvedAt: data.approvedAt,
    };
  },
};

export const passConverter: FirestoreDataConverter<Pass> = {
    toFirestore: (pass: Pass): DocumentData => {
      const { id, ...data } = pass;
      return data;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Pass => {
        const data = snapshot.data(options);
        const baseData = {
            id: snapshot.id,
            type: data.type,
            plateAlpha: data.plateAlpha,
            plateNum: data.plateNum,
            location: data.location,
            expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt : new Timestamp(data.expiresAt.seconds, data.expiresAt.nanoseconds),
            status: data.status,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds),
            createdBy: data.createdBy,
            createdByName: data.createdByName,
            createdByCompany: data.createdByCompany,
            qrPayload: data.qrPayload,
        };

        if (data.type === 'standard') {
            return {
                ...baseData,
                type: 'standard',
                ownerName: data.ownerName,
                serial: data.serial,
                ownerCompany: data.ownerCompany,
            };
        } else {
             return {
                ...baseData,
                type: 'visitor',
                visitorName: data.visitorName,
                personToVisit: data.personToVisit,
                purpose: data.purpose,
            };
        }
    },
};
