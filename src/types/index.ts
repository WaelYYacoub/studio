import type { Timestamp } from "firebase/firestore";

export type Role = 'owner' | 'admin' | 'user' | 'pending' | 'rejected';
export type PassStatus = 'active' | 'expired' | 'revoked';
export type PassType = 'standard' | 'visitor';

export interface AppUser {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  company?: string;
  companyId?: string;
  workLocation?: string;
  role: Role;
  createdAt: any;
  approvedBy?: string | null;
  approvedAt?: Timestamp | null;
}

export interface QrPayload {
    v: 1;
    pid: string;
    pa: string;
    pn: string;
    exp: number;
}

export interface BasePass {
  id: string;
  type: PassType;
  plateAlpha: string;
  plateNum: string;
  location: string;
  expiresAt: Timestamp;
  status: PassStatus;
  createdAt: any;
  createdBy: string;
  createdByName: string;
  createdByCompany?: string;
  qrPayload: QrPayload;
}

export interface StandardPass extends BasePass {
  type: 'standard';
  ownerName: string;
  serial: string;
  ownerCompany: string;
}

export interface VisitorPass extends BasePass {
  type: 'visitor';
  visitorName: string;
  personToVisit: string;
  purpose: string;
}

export type Pass = StandardPass | VisitorPass;
