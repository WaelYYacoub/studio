import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp, Timestamp, type DocumentData, type FirestoreDataConverter, type QueryDocumentSnapshot, type SnapshotOptions } from "firebase/firestore";
import type { AppUser, Pass, Role } from "@/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
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
