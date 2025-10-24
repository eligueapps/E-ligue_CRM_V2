import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface TicketFormModalProps {
  onClose: () => void;
}

const TicketFormModal: React.FC<TicketFormModalProps> = ({ onClose }) => {
  const { currentUser, addTicket, applications } = useAppContext();
  const [application, setApplication] = useState(applications[0] || '');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !currentUser) return;

    addTicket({
      title,
      application,
      location,
      description,
      attachments,
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-8 m-4 max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Créer un nouveau ticket</h2>
          
          {/* Section 1 */}
          <div className="mb-6 border-b pb-4">
            <h3 className="font-semibold text-lg mb-2 text-gray-700">1. Application concernée</h3>
            <select
              value={application}
              onChange={(e) => setApplication(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {applications.map(app => <option key={app} value={app}>{app}</option>)}
            </select>
          </div>

          {/* Section 2 */}
          <div className="mb-6 border-b pb-4">
            <h3 className="font-semibold text-lg mb-2 text-gray-700">2. Détails du ticket</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Titre du ticket" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md"/>
              <input type="text" placeholder="Local concerné" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"/>
              <textarea placeholder="Description du problème" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full p-2 border border-gray-300 rounded-md"/>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pièces jointes</label>
                <input type="file" multiple onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              </div>
            </div>
          </div>
          
          {/* Section 3 */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2 text-gray-700">3. Informations de l’utilisateur</h3>
            <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
                <p><strong>Nom complet:</strong> {currentUser.fullName}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Téléphone:</strong> {currentUser.phone}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Annuler</button>
            <button type="submit" className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Créer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketFormModal;