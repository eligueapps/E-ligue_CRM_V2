
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const LoginPage: React.FC = () => {
  const { login } = useAppContext();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(loginValue, password);
    if (!success) {
      setError('Login ou mot de passe incorrect.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">E-LIGUE Assistance</h1>
          <p className="mt-2 text-gray-600">Connectez-vous à votre compte</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-700">
              Login
            </label>
            <div className="mt-1">
              <input
                id="login"
                name="login"
                type="text"
                autoComplete="username"
                required
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-input" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div className="mt-1">
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md" role="alert">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
