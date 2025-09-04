
import React from 'react';
import { LeaveRequest, User, UserRole, LeaveStatus } from '../types';
import { generatePdf } from '../services/pdfService';

interface LeaveRequestDetailsProps {
  request: LeaveRequest;
  onClose: () => void;
  currentUser: User;
}

const LeaveRequestDetails: React.FC<LeaveRequestDetailsProps> = ({ request, onClose, currentUser }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };
  
  const handleGeneratePdf = () => {
    generatePdf('pdf-content', `ใบลา-${request.userName.replace(/\s/g, '_')}-${request.id}`);
  };
  
  const statusInfo = {
    [LeaveStatus.PENDING]: { text: 'รออนุมัติ', color: 'text-yellow-600 bg-yellow-100' },
    [LeaveStatus.APPROVED]: { text: 'อนุมัติแล้ว', color: 'text-green-600 bg-green-100' },
    [LeaveStatus.REJECTED]: { text: 'ปฏิเสธ', color: 'text-red-600 bg-red-100' },
  };

  const getDurationText = () => {
    switch (request.duration) {
      case 'MORNING': return 'ครึ่งวัน (เช้า)';
      case 'AFTERNOON': return 'ครึ่งวัน (บ่าย)';
      default: return `${calculateLeaveDays(request.startDate, request.endDate)} วัน`;
    }
  };

  const calculateLeaveDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">รายละเอียดใบลา</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto" id="pdf-content-wrapper">
          <div className="p-8 border border-gray-200" id="pdf-content">
            <h3 className="text-center text-xl font-bold mb-2">ใบลาโรงเรียนคุรุชนพัฒนา</h3>
            <p className="text-center text-sm text-gray-600 mb-6">เขียนที่: โรงเรียนคุรุชนพัฒนา</p>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <p><strong>ผู้ยื่นใบลา:</strong> {request.userName}</p>
                <p><strong>วันที่ยื่น:</strong> {formatDate(request.submittedAt)}</p>
                <p><strong>ประเภทการลา:</strong> {request.leaveType}</p>
                <div className={`px-3 py-1 text-sm font-medium inline-block rounded-full ${statusInfo[request.status].color}`}>
                    <strong>สถานะ:</strong> {statusInfo[request.status].text}
                </div>
                <p><strong>วันที่เริ่มลา:</strong> {formatDate(request.startDate)}</p>
                <p><strong>วันที่สิ้นสุด:</strong> {formatDate(request.endDate)}</p>
                <p className="col-span-2"><strong>ระยะเวลา:</strong> {getDurationText()}</p>
                <div className="col-span-2">
                    <strong>เหตุผลการลา:</strong>
                    <p className="mt-1 p-2 border rounded-md bg-gray-50 h-20">{request.reason}</p>
                </div>
                 <div className="col-span-2">
                    <strong>ลายมือชื่อผู้ลา:</strong>
                    <div className="mt-1 p-2 border rounded-md bg-gray-50 h-32 flex items-center justify-center">
                        {request.signature ? (
                            <img src={request.signature} alt="ลายเซ็น" className="max-h-full max-w-full"/>
                        ) : (
                            <span className="text-gray-400">ไม่มีลายเซ็น</span>
                        )}
                    </div>
                </div>
                 <div className="col-span-2 mt-4 pt-4 border-t">
                    <p className="font-semibold">สำหรับผู้บริหาร:</p>
                    {request.status === LeaveStatus.APPROVED ? (
                        <>
                            <p className="mt-2"><strong>ผู้อนุมัติ:</strong> {request.approvedBy}</p>
                            <p><strong>วันที่อนุมัติ:</strong> {formatDate(request.approvedAt!)}</p>
                            <div className="mt-4">
                                <p className="text-center">....................................................</p>
                                <p className="text-center">({request.approvedBy})</p>
                                <p className="text-center">ผู้อนุมัติ</p>
                            </div>
                        </>
                    ) : (
                         <div className="mt-8">
                            <p className="text-center">....................................................</p>
                            <p className="text-center">(....................................................)</p>
                            <p className="text-center">ผู้อนุมัติ</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
            ปิด
          </button>
          {request.status === LeaveStatus.APPROVED && (
            <button
                type="button"
                onClick={handleGeneratePdf}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              ดาวน์โหลด PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestDetails;
