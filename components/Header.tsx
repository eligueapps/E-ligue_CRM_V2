
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogoutIcon, UserIcon } from './icons';

const Header: React.FC = () => {
  const { currentUser, logout } = useAppContext();

  if (!currentUser) return null;

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-slate-800">E-LIGUE <span className="text-blue-600">Assistance</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <UserIcon className="h-6 w-6 text-slate-500" />
                <div className="text-right">
                    <p className="font-semibold text-sm text-slate-700">{currentUser.fullName}</p>
                    <p className="text-xs text-slate-500">{currentUser.role}</p>
                </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              aria-label="Logout"
            >
              <LogoutIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
