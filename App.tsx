import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeaveRequestList from './components/LeaveRequestList';
import LeaveRequestForm from './components/LeaveRequestForm';
import SummaryCards from './components/SummaryCards';
import LeaveRequestDetails from './components/LeaveRequestDetails';
import Login from './components/Login';
import LeaveSummary from './components/LeaveSummary';
import { User, LeaveRequest, LeaveStatus, UserRole } from './types';
import * as api from './services/apiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<string[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<LeaveRequest | null>(null);
  const [requestToView, setRequestToView] = useState<LeaveRequest | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { users, leaveTypes, leaveRequests } = await api.getInitialData();
        setUsers(users);
        setLeaveTypes(leaveTypes);
        setLeaveRequests(leaveRequests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogin = async (userId: string, password: string) => {
    try {
        setIsLoading(true);
        setLoginError(null);
        const user = await api.login(userId, password);
        setCurrentUser(user);
    } catch (err) {
        setLoginError((err as Error).message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const openForm = (request?: LeaveRequest) => {
    setRequestToEdit(request || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setRequestToEdit(null);
  };

  const openDetails = (request: LeaveRequest) => {
    setRequestToView(request);
  };

  const closeDetails = () => {
    setRequestToView(null);
  };

  const handleSaveRequest = async (request: LeaveRequest) => {
    try {
        const isEditing = !!requestToEdit;
        const savedRequest = isEditing 
            ? await api.updateLeaveRequest(request)
            : await api.createLeaveRequest(request);

        setLeaveRequests(prev => {
            const newRequests = isEditing
                ? prev.map(r => r.id === savedRequest.id ? savedRequest : r)
                : [savedRequest, ...prev];
            return newRequests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        });
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
    closeForm();
  };

  const handleDeleteRequest = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบใบงานนี้?')) {
        try {
            await api.deleteLeaveRequest(id);
            setLeaveRequests(leaveRequests.filter(r => r.id !== id));
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    }
  };

  const handleApproveRequest = async (id: string) => {
    if(!currentUser || currentUser.role !== UserRole.ADMIN) return;

    const request = leaveRequests.find(r => r.id === id);
    if (!request) return;

    const updatedRequest = {
        ...request,
        status: LeaveStatus.APPROVED,
        approvedBy: currentUser.name,
        approvedAt: new Date().toISOString()
    };
    
    try {
        await api.updateLeaveRequest(updatedRequest);
        setLeaveRequests(leaveRequests.map(r => r.id === id ? updatedRequest : r));
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการอนุมัติใบลา');
    }
  };

  if (isLoading && users.length === 0) {
      return <div className="min-h-screen flex items-center justify-center">กำลังโหลดข้อมูล...</div>
  }
  
  if (error) {
      return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} isLoading={isLoading} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sarabun">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h2>
                    <p className="text-gray-600">ยินดีต้อนรับ, {currentUser.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsSummaryOpen(true)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 flex items-center"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                        ดูสรุปการลา
                    </button>
                    {currentUser.role === UserRole.TEACHER && (
                         <button
                            onClick={() => openForm()}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 flex items-center"
                            >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            ยื่นใบลาใหม่
                        </button>
                    )}
                </div>
            </div>

            <SummaryCards requests={leaveRequests} currentUser={currentUser} />
            
            <LeaveRequestList
              requests={leaveRequests}
              currentUser={currentUser}
              onView={openDetails}
              onEdit={openForm}
              onDelete={handleDeleteRequest}
              onApprove={handleApproveRequest}
            />
      </main>
      
      {isFormOpen && (
        <LeaveRequestForm
          requestToEdit={requestToEdit}
          currentUser={currentUser}
          onSave={handleSaveRequest}
          onClose={closeForm}
          leaveTypes={leaveTypes}
        />
      )}

      {requestToView && (
        <LeaveRequestDetails
          request={requestToView}
          currentUser={currentUser}
          onClose={closeDetails}
        />
      )}

      {isSummaryOpen && (
        <LeaveSummary 
            requests={leaveRequests}
            currentUser={currentUser}
            onClose={() => setIsSummaryOpen(false)}
            leaveTypes={leaveTypes}
        />
      )}
    </div>
  );
};

export default App;