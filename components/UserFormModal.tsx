import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Role } from '../types';

interface UserFormModalProps {
  user: User | null;
  onClose: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, onClose }) => {
  const { addUser, updateUser, applications, addApplication } = useAppContext();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    entity: '',
    position: '',
    role: Role.User,
    applications: [] as string[],
    login: '',
    password: '',
  });
  const [newApp, setNewApp] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        entity: user.entity,
        position: user.position,
        role: user.role,
        applications: user.applications,
        login: user.login,
        password: '', // Do not pre-fill password for security
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplicationChange = (app: string) => {
    setFormData(prev => {
        const newApps = prev.applications.includes(app)
            ? prev.applications.filter(a => a !== app)
            : [...prev.applications, app];
        return { ...prev, applications: newApps };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
        const { password, ...rest } = formData;
        const updates: Partial<User> = rest;
        if(password) {
            (updates as User).password = password;
        }
      updateUser(user.id, updates);
    } else {
      addUser(formData);
    }
    onClose();
  };

  const handleAddNewApp = () => {
    if (newApp.trim()) {
      addApplication(newApp.trim());
      setNewApp('');
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 m-4 max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{user ? 'Modifier' : 'Ajouter'} un utilisateur</h2>
          
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nom et prénom" required className="w-full p-2 border rounded-md"/>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full p-2 border rounded-md"/>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Téléphone" required className="w-full p-2 border rounded-md"/>
          <input type="text" name="entity" value={formData.entity} onChange={handleChange} placeholder="Entité" required className="w-full p-2 border rounded-md"/>
          <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Poste" required className="w-full p-2 border rounded-md"/>
          
          <hr/>
          <p className="text-sm text-gray-600">Identifiants de connexion</p>
          <input type="text" name="login" value={formData.login} onChange={handleChange} placeholder="Login" required className="w-full p-2 border rounded-md"/>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={user ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"} required={!user} className="w-full p-2 border rounded-md"/>
          <hr/>
          
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded-md">
            {Object.values(Role).map(roleValue => (
              <option key={roleValue} value={roleValue}>{roleValue}</option>
            ))}
          </select>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Applications concernées</label>
             <div className="grid grid-cols-2 gap-2">
                {applications.map(app => (
                     <label key={app} className="flex items-center space-x-2">
                        <input 
                            type="checkbox" 
                            checked={formData.applications.includes(app)} 
                            onChange={() => handleApplicationChange(app)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{app}</span>
                    </label>
                ))}
             </div>
              <div className="flex items-center space-x-2 mt-4">
                  <input 
                      type="text" 
                      value={newApp} 
                      onChange={(e) => setNewApp(e.target.value)}
                      placeholder="Ajouter une application..."
                      className="flex-grow p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewApp();
                        }
                      }}
                  />
                  <button 
                      type="button" 
                      onClick={handleAddNewApp}
                      className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                  >
                      Ajouter
                  </button>
              </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Annuler</button>
            <button type="submit" className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">{user ? 'Mettre à jour' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;