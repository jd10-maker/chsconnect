export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  currentClass?: string; // e.g. "Grade 10A"
  isVerifiedStudent?: boolean;
  department?: string;
}

export type ItemCategory = 'Watches' | 'Pouches' | 'Bags' | 'Water Bottles' | 'Other';

export type FoundItemStatus =
  | 'Stored / Available'
  | 'Claim Pending'
  | 'Claim Approved'
  | 'Claimed / Collected'
  | 'Unclaimed (15+ Days)'
  | 'Redistributed'
  | 'Disposed';

export interface FoundItem {
  id: string;
  name: string;
  category: ItemCategory;
  customCategory?: string;
  photos: string[]; // Primary image is photos[0]
  description: string;
  dateFound: string; // YYYY-MM-DD
  locationFound: string;
  storageLocation: string; // e.g. "P.E. Department Office, Shelf B-12"
  privateIdentifyingDetails: string; // Confidential evidence notes
  reportedByTeacherEmail: string;
  reportedByTeacherName: string;
  status: FoundItemStatus;
  createdAt: string;
  updatedAt: string;
  daysUnclaimed: number;
  approvedClaimId?: string;
  handoverDetails?: HandoverRecord;
}

export interface LostReport {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentClass: string;
  itemName: string;
  category: ItemCategory;
  customCategory?: string;
  description: string;
  dateLost: string; // YYYY-MM-DD
  locationLost: string;
  photo?: string;
  distinctiveFeatures: string;
  additionalNotes?: string;
  status: 'Open' | 'Potential Match Found' | 'Resolved / Claimed' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export type ClaimStatus =
  | 'Pending Review'
  | 'Additional Evidence Requested'
  | 'Approved (Ready for Pickup)'
  | 'Rejected'
  | 'Collected';

export interface OwnershipClaim {
  id: string;
  referenceCode: string; // e.g. "CLM-2026-8921"
  foundItemId: string;
  foundItemName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentClass: string;
  description: string;
  privateDetailsEvidence: string;
  photoProof?: string;
  contactNumber?: string;
  status: ClaimStatus;
  teacherFeedback?: string;
  reviewedByTeacherName?: string;
  reviewedAt?: string;
  collectionInstructions?: string;
  evidenceHistory?: Array<{
    sender: 'student' | 'teacher';
    message: string;
    photo?: string;
    timestamp: string;
  }>;
  handoverRecord?: HandoverRecord;
  createdAt: string;
  updatedAt: string;
}

export interface HandoverRecord {
  referenceCode: string;
  itemType: 'found_claim' | 'unclaimed_redistribution' | 'donation';
  itemId: string;
  recipientName: string;
  recipientEmail: string;
  recipientClass: string;
  staffName: string;
  staffEmail: string;
  verifiedStudentId: boolean;
  handoverDate: string;
  collectionLocation: string;
  notes?: string;
}

export interface UnclaimedRequest {
  id: string;
  referenceCode: string; // e.g. "RED-2026-4512"
  foundItemId: string;
  foundItemName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentClass: string;
  reason: string;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Handed Over';
  reviewedBy?: string;
  reviewedAt?: string;
  handoverRecord?: HandoverRecord;
  createdAt: string;
}

export type DonationCategory = 'Books' | 'Uniforms & PE Gear' | 'Stationery' | 'Sports Equipment' | 'Electronics' | 'Other';
export type DonorType = 'Student' | 'Staff' | 'Former Student / Alumni';
export type ItemCondition = 'Brand New' | 'Like New' | 'Gently Used' | 'Fair';

export interface DonationItem {
  id: string;
  title: string;
  category: DonationCategory;
  photos: string[];
  description: string;
  condition: ItemCondition;
  donorType: DonorType;
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  status: 'Pending Approval' | 'Available' | 'Reserved' | 'Distributed';
  eligibilityRequirements?: string;
  collectionInstructions?: string;
  requestDeadline?: string;
  approvedByTeacher?: string;
  approvedRecipientId?: string;
  approvedRecipientName?: string;
  approvedRecipientClass?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationRequest {
  id: string;
  referenceCode: string; // e.g. "DON-2026-3190"
  donationId: string;
  donationTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentClass: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Declined' | 'Collected';
  reviewedBy?: string;
  reviewedAt?: string;
  handoverRecord?: HandoverRecord;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientEmail: string; // or "teacher-all"
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  linkTarget?: string; // e.g. "claims", "donations", "pe-desk"
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  actorName: string;
  actorRole: UserRole;
  targetType: 'found_item' | 'claim' | 'handover' | 'donation' | 'settings' | 'unclaimed';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface SchoolSettings {
  schoolName: string;
  schoolMotto: string;
  schoolDomain: string; // e.g. "cathedral.edu" or "gmail.com"
  requireSchoolEmail: boolean;
  facultyVerificationCode: string; // e.g. "CHS-2026"
  holdingPeriodDays: number; // default 15
  collectionPointName: string; // e.g. "P.T. Department Office"
  collectionPointLocation: string; // e.g. "P.T. Department, School Ground"
  collectionHours: string; // e.g. "Monday – Friday: 12:30 PM – 1:30 PM & 3:30 PM – 4:15 PM"
  availableClasses: string[];
  categories: ItemCategory[];
  donationApprovalRequired: boolean;
  allowAlumniDonations: boolean;
}
