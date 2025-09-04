import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { LeaveRequest, LeaveDuration, LeaveStatus, User } from '../types';

interface LeaveRequestFormProps {
  requestToEdit?: LeaveRequest | null;
  currentUser: User;
  onSave: (request: LeaveRequest) => void;
  onClose: () => void;
  leaveTypes: string[];
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ requestToEdit, currentUser, onSave, onClose, leaveTypes }) => {
  const [leaveType, setLeaveType] = useState(requestToEdit?.leaveType || (leaveTypes.length > 0 ? leaveTypes[0] : ''));
  const [startDate, setStartDate] = useState(requestToEdit?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(requestToEdit?.endDate || new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<LeaveDuration>(requestToEdit?.duration || LeaveDuration.FULL_DAY);
  const [reason, setReason] = useState(requestToEdit?.reason || '');
  const [signature, setSignature] = useState(requestToEdit?.signature || '');
  const [error, setError] = useState('');
  
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (requestToEdit) {
        setLeaveType(requestToEdit.leaveType);
        setStartDate(requestToEdit.startDate);
        setEndDate(requestToEdit.endDate);
        setDuration(requestToEdit.duration);
        setReason(requestToEdit.reason);
        setSignature(requestToEdit.signature);
    }
  }, [requestToEdit]);
  
  const handleSave = () => {
    const isSignatureEmpty = sigCanvas.current ? sigCanvas.current.isEmpty() : true;
    const finalSignature = sigCanvas.current ? sigCanvas.current.toDataURL('image/png') : '';

    if (!reason.trim()) {
        setError('กรุณากรอกเหตุผลการลา');
        return;
    }

    if (!requestToEdit && isSignatureEmpty) {
        setError('กรุณาลงลายมือชื่อ');
        return;
    }
    setError('');

    const newRequest: LeaveRequest = {
      id: requestToEdit?.id || `leave-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      leaveType,
      startDate,
      endDate: duration !== LeaveDuration.FULL_DAY ? startDate : endDate,
      duration,
      reason,
      signature: !isSignatureEmpty ? finalSignature : signature,
      status: requestToEdit?.status || LeaveStatus.PENDING,
      submittedAt: requestToEdit?.submittedAt || new Date().toISOString(),
    };
    onSave(newRequest);
  };
  
  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignature('');
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDuration = e.target.value as LeaveDuration;
    setDuration(newDuration);
    if(newDuration !== LeaveDuration.FULL_DAY) {
        setEndDate(startDate);
    }
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setStartDate(e.target.value);
      if (duration !== LeaveDuration.FULL_DAY) {
          setEndDate(e.target.value);
      } else if (new Date(e.target.value) > new Date(endDate)) {
          setEndDate(e.target.value);
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">{requestToEdit ? 'แก้ไขใบลา' : 'ยื่นใบลาใหม่'}</h2>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">ประเภทการลา</label>
                    <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        {leaveTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ระยะเวลา</label>
                    <select value={duration} onChange={handleDurationChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value={LeaveDuration.FULL_DAY}>เต็มวัน</option>
                        <option value={LeaveDuration.MORNING}>ครึ่งวันเช้า</option>
                        <option value={LeaveDuration.AFTERNOON}>ครึ่งวันบ่าย</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">วันที่เริ่มลา</label>
                    <input type="date" value={startDate} onChange={handleStartDateChange} min={new Date().toISOString().split('T')[0]} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                </div>
                 {duration === LeaveDuration.FULL_DAY && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                    </div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">เหตุผลการลา</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">ลายมือชื่อ</label>
                <div className="mt-1 border border-gray-300 rounded-md">
                    {/* FIX: Removed the `penColor` prop to resolve a TypeScript error from outdated type definitions. The default value is 'black', so functionality is unchanged. */}
                    <SignatureCanvas
                        ref={sigCanvas}
                        canvasProps={{ className: 'w-full h-32 rounded-md' }}
                    />
                </div>
                <button onClick={clearSignature} className="text-sm text-blue-600 hover:underline mt-1">ล้างลายเซ็น</button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">ยกเลิก</button>
            <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">บันทึก</button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestForm;