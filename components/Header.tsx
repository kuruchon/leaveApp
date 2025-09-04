import React from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <img 
                src="https://kuruchon.github.io/logo_256.png" 
                alt="Logo โรงเรียนคุรุชนพัฒนา" 
                className="w-12 h-12"
            />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 ml-3">
              ระบบใบลาออนไลน์ <span className="hidden sm:inline">- โรงเรียนคุรุชนพัฒนา</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
                <p className="font-semibold text-gray-800">{currentUser.name}</p>
                <p className="text-sm text-gray-500">{currentUser.role === 'ADMIN' ? 'ผู้บริหาร' : 'ครู'}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 flex items-center"
              title="ออกจากระบบ"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
