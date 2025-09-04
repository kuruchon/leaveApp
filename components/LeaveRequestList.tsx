
import React from 'react';
import { LeaveRequest, User, UserRole, LeaveStatus } from '../types';

interface LeaveRequestListProps {
  requests: LeaveRequest[];
  currentUser: User;
  onView: (request: LeaveRequest) => void;
  onEdit: (request: LeaveRequest) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
}

const LeaveRequestList: React.FC<LeaveRequestListProps> = ({ requests, currentUser, onView, onEdit, onDelete, onApprove }) => {
  const userRequests = currentUser.role === UserRole.TEACHER
    ? requests.filter(r => r.userId === currentUser.id)
    : requests;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  const statusInfo = {
    [LeaveStatus.PENDING]: { text: 'รออนุมัติ', color: 'bg-yellow-100 text-yellow-800' },
    [LeaveStatus.APPROVED]: { text: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800' },
    [LeaveStatus.REJECTED]: { text: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">รายการใบลา</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {currentUser.role === UserRole.ADMIN && <th className="px-6 py-3 font-medium">ชื่อผู้ลา</th>}
              <th className="px-6 py-3 font-medium">ประเภท</th>
              <th className="px-6 py-3 font-medium">วันที่ลา</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {userRequests.length === 0 ? (
              <tr>
                <td colSpan={currentUser.role === UserRole.ADMIN ? 5 : 4} className="text-center py-10 text-gray-500">
                  ไม่มีข้อมูลใบลา
                </td>
              </tr>
            ) : (
              userRequests.map(req => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  {currentUser.role === UserRole.ADMIN && <td className="px-6 py-4 font-medium text-gray-900">{req.userName}</td>}
                  <td className="px-6 py-4">{req.leaveType}</td>
                  <td className="px-6 py-4">{formatDate(req.startDate)} - {formatDate(req.endDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo[req.status].color}`}>
                      {statusInfo[req.status].text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                       <button onClick={() => onView(req)} className="text-blue-600 hover:text-blue-800" title="ดูรายละเอียด">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                      { (currentUser.role === UserRole.ADMIN || (currentUser.role === UserRole.TEACHER && req.status === LeaveStatus.PENDING)) && (
                         <>
                            <button onClick={() => onEdit(req)} className="text-yellow-600 hover:text-yellow-800" title="แก้ไข">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                            </button>
                            <button onClick={() => onDelete(req.id)} className="text-red-600 hover:text-red-800" title="ลบ">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            </button>
                         </>
                      )}
                      { currentUser.role === UserRole.ADMIN && req.status === LeaveStatus.PENDING && (
                           <button onClick={() => onApprove(req.id)} className="text-green-600 hover:text-green-800" title="อนุมัติ">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveRequestList;
