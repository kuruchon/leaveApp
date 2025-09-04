import React, { useState, useMemo } from 'react';
import { LeaveRequest, User, UserRole, LeaveDuration, LeaveStatus } from '../types';

interface LeaveSummaryProps {
  requests: LeaveRequest[];
  currentUser: User;
  onClose: () => void;
  leaveTypes: string[];
}

const calculateLeaveDays = (start: string, end: string, duration: LeaveDuration): number => {
    if (duration !== LeaveDuration.FULL_DAY) return 0.5;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};


const LeaveSummary: React.FC<LeaveSummaryProps> = ({ requests, currentUser, onClose, leaveTypes }) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [selectedLeaveType, setSelectedLeaveType] = useState('ALL');


    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const reqDate = new Date(req.startDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            const isDateInRange = req.status === LeaveStatus.APPROVED && reqDate >= start && reqDate <= end;
            const isCorrectLeaveType = selectedLeaveType === 'ALL' || req.leaveType === selectedLeaveType;
            return isDateInRange && isCorrectLeaveType;
        });
    }, [requests, startDate, endDate, selectedLeaveType]);

    const teacherSummary = useMemo(() => {
        if (currentUser.role !== UserRole.TEACHER) return null;
        const userRequests = filteredRequests.filter(r => r.userId === currentUser.id);
        const summary: { [key: string]: { days: number; count: number } } = {};
        
        userRequests.forEach(req => {
            const days = calculateLeaveDays(req.startDate, req.endDate, req.duration);
            if (!summary[req.leaveType]) {
                summary[req.leaveType] = { days: 0, count: 0 };
            }
            summary[req.leaveType].days += days;
            summary[req.leaveType].count += 1;
        });
        return summary;
    }, [filteredRequests, currentUser]);

    const adminSummary = useMemo(() => {
        if (currentUser.role !== UserRole.ADMIN) return null;
        const summary: {
            [userName: string]: {
                details: { [leaveType: string]: { days: number; count: number } };
                total: { days: number; count: number };
            };
        } = {};

        filteredRequests.forEach(req => {
            if (!summary[req.userName]) {
                summary[req.userName] = { details: {}, total: { days: 0, count: 0 } };
            }
            if (!summary[req.userName].details[req.leaveType]) {
                summary[req.userName].details[req.leaveType] = { days: 0, count: 0 };
            }
            
            const days = calculateLeaveDays(req.startDate, req.endDate, req.duration);

            summary[req.userName].details[req.leaveType].days += days;
            summary[req.userName].details[req.leaveType].count += 1;
            summary[req.userName].total.days += days;
            summary[req.userName].total.count += 1;
        });
        return summary;
    }, [filteredRequests, currentUser]);
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">สรุปข้อมูลการลา</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">ตั้งแต่วันที่</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                    </div>
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">ถึงวันที่</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">ประเภทการลา</label>
                        <select value={selectedLeaveType} onChange={e => setSelectedLeaveType(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="ALL">ทุกประเภท</option>
                            {leaveTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {teacherSummary && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">สรุปการลาของคุณ ({currentUser.name})</h3>
                        <div className="overflow-x-auto border rounded-lg">
                             <table className="w-full min-w-max text-left text-sm text-gray-600">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">ประเภทการลา</th>
                                        <th className="px-6 py-3 font-medium text-right">จำนวนครั้ง</th>
                                        <th className="px-6 py-3 font-medium text-right">จำนวนวัน</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(teacherSummary).length > 0 ? Object.entries(teacherSummary).map(([type, stats]) => (
                                        <tr key={type} className="border-t">
                                            <td className="px-6 py-4">{type}</td>
                                            <td className="px-6 py-4 text-right font-semibold">{stats.count}</td>
                                            <td className="px-6 py-4 text-right font-semibold">{stats.days}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="text-center py-4">ไม่มีข้อมูลการลาในช่วงวันที่เลือก</td></tr>
                                    )}
                                     <tr className="border-t bg-gray-50 font-bold">
                                        <td className="px-6 py-4">รวมทั้งหมด</td>
                                        <td className="px-6 py-4 text-right">{Object.values(teacherSummary).reduce((acc, curr) => acc + curr.count, 0)}</td>
                                        <td className="px-6 py-4 text-right">{Object.values(teacherSummary).reduce((acc, curr) => acc + curr.days, 0)}</td>
                                     </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {adminSummary && (
                     <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">สรุปการลาของบุคลากรทั้งหมด</h3>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full min-w-max text-left text-sm text-gray-600">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">ชื่อ-สกุล</th>
                                        <th className="px-6 py-3 font-medium">ประเภทการลา</th>
                                        <th className="px-6 py-3 font-medium text-right">จำนวนครั้ง</th>
                                        <th className="px-6 py-3 font-medium text-right">จำนวนวัน</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(adminSummary).length > 0 ? Object.entries(adminSummary).map(([userName, data]) => (
                                        <React.Fragment key={userName}>
                                            {Object.entries(data.details).map(([type, stats], index) => (
                                                <tr key={`${userName}-${type}`} className="border-t">
                                                    {index === 0 && <td rowSpan={Object.keys(data.details).length} className="px-6 py-4 align-top font-semibold">{userName}</td>}
                                                    <td className="px-6 py-4">{type}</td>
                                                    <td className="px-6 py-4 text-right">{stats.count}</td>
                                                    <td className="px-6 py-4 text-right">{stats.days}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                                <td colSpan={2} className="px-6 py-2 text-right">รวมของ {userName}</td>
                                                <td className="px-6 py-2 text-right">{data.total.count}</td>
                                                <td className="px-6 py-2 text-right">{data.total.days}</td>
                                            </tr>
                                        </React.Fragment>
                                    )) : (
                                       <tr><td colSpan={4} className="text-center py-4">ไม่มีข้อมูลการลาในช่วงวันที่เลือก</td></tr> 
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
             <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
                ปิด
              </button>
            </div>
          </div>
        </div>
    );
};

export default LeaveSummary;