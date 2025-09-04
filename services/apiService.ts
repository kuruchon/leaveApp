import { User, LeaveRequest } from '../types';

// 🔴 สำคัญ: เปลี่ยน URL นี้เป็น Web App URL ที่คุณได้จากการ Deploy Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbypT6i66GpRS548GpRZ4Jy1IBOTKf4wmZGvsNl-AnBKaJoti2MAM0b8jC4v7VF3kexE/exec';

const apiCall = async (action: string, payload?: any) => {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        // Change content type to text/plain to avoid CORS preflight issues with Google Apps Script
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, payload }),
      redirect: 'follow',
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์');
    }
    return result;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    throw error;
  }
};

export const getInitialData = async (): Promise<{ users: User[], leaveTypes: string[], leaveRequests: LeaveRequest[] }> => {
  const result = await apiCall('getInitialData');
  return result.data;
};

export const login = async (userId: string, password: string): Promise<User> => {
    const result = await apiCall('login', { userId, password });
    return result.user;
};

export const createLeaveRequest = async (request: LeaveRequest): Promise<LeaveRequest> => {
    const result = await apiCall('createLeave', request);
    return result.data;
};

export const updateLeaveRequest = async (request: LeaveRequest): Promise<LeaveRequest> => {
    const result = await apiCall('updateLeave', request);
    return result.data;
};

export const deleteLeaveRequest = async (id: string): Promise<{id: string}> => {
    const result = await apiCall('deleteLeave', { id });
    return result;
};