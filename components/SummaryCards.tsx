
import React from 'react';
import { LeaveRequest, UserRole, User, LeaveStatus, LeaveDuration } from '../types';

interface SummaryCardsProps {
  requests: LeaveRequest[];
  currentUser: User;
}

const calculateLeaveDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};

const SummaryCards: React.FC<SummaryCardsProps> = ({ requests, currentUser }) => {
  const userRequests = currentUser.role === UserRole.TEACHER
    ? requests.filter(r => r.userId === currentUser.id)
    : requests;

  const approvedLeaves = userRequests.filter(r => r.status === LeaveStatus.APPROVED);

  const totalLeaveDays = approvedLeaves.reduce((total, req) => {
    if (req.duration === LeaveDuration.FULL_DAY) {
        return total + calculateLeaveDays(req.startDate, req.endDate);
    }
    return total + 0.5;
  }, 0);

  const pendingRequests = userRequests.filter(r => r.status === LeaveStatus.PENDING).length;
  const approvedRequests = approvedLeaves.length;

  const cards = [
    { title: 'วันลาทั้งหมด (ที่อนุมัติ)', value: totalLeaveDays, icon: 'M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75V17.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z', color: 'bg-blue-500' },
    { title: 'รายการรออนุมัติ', value: pendingRequests, icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-yellow-500' },
    { title: 'รายการอนุมัติแล้ว', value: approvedRequests, icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map(card => (
        <div key={card.title} className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className={`${card.color} text-white rounded-full p-4`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
            </svg>
          </div>
          <div className="ml-6">
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
