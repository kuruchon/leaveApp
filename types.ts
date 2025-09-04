export enum UserRole {
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  password?: string;
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum LeaveDuration {
  FULL_DAY = 'FULL_DAY',
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: LeaveDuration;
  reason: string;
  signature: string; // base64 data URL
  status: LeaveStatus;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}