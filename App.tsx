
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

const Main: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {currentUser ? <DashboardPage /> : <LoginPage />}
    </div>
  );
};

export default App;
