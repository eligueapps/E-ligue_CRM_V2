import React, { useState, useMemo } from 'react';
import { Ticket, User, Role, TicketStatus } from '../types';
import { useAppContext } from '../context/AppContext';

interface TicketDetailsModalProps {
  ticket: Ticket;
  onClose: () => void;
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ ticket, onClose }) => {
  const { currentUser, technicians, updateTicket, validateTicket, invoices } = useAppContext();
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>(ticket.assignedTo?.id || '');

  if (!currentUser) return null;

  const isValidated = useMemo(() => invoices.some(inv => inv.ticketId === ticket.id), [invoices, ticket.id]);

  const handleAssign = () => {
    const technician = technicians.find(tech => tech.id === selectedTechnicianId);
    if (technician) {
      updateTicket(ticket.id, { assignedTo: technician, status: TicketStatus.InProgress });
      onClose();
    }
  };

  const handleCloseTicket = () => {
    updateTicket(ticket.id, { status: TicketStatus.Closed });
    onClose();
  };

  const handleValidateTicket = () => {
    if (isValidated) {
        alert("Ce ticket a déjà été validé pour le paiement.");
        return;
    }
    const success = validateTicket(ticket);
    if (success) {
      alert(`Facture générée pour le ticket ${ticket.serialNumber}`);
    } else {
      alert("Ce ticket a déjà été validé pour le paiement.");
    }
  };

  const canAssign = currentUser.role === Role.Admin && ticket.status !== TicketStatus.Closed;
  const canClose = currentUser.role === Role.Technician && ticket.status === TicketStatus.InProgress && ticket.assignedTo?.id === currentUser.id;
  const canValidate = currentUser.role === Role.Admin && ticket.status === TicketStatus.Closed;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-8 m-4 max-h-full overflow-y-auto">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-800">{ticket.title} <span className="text-base font-normal text-gray-500">({ticket.serialNumber})</span></h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
             <div>
                <h4 className="font-semibold text-gray-600">Statut</h4>
                <p>{ticket.status}</p>
            </div>
            <div>
                <h4 className="font-semibold text-gray-600">Application</h4>
                <p>{ticket.application}</p>
            </div>
             <div>
                <h4 className="font-semibold text-gray-600">Local</h4>
                <p>{ticket.location || 'Non spécifié'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-600">Description</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md border">{ticket.description}</p>
            </div>
             {ticket.attachments.length > 0 && <div>
                <h4 className="font-semibold text-gray-600">Pièces jointes</h4>
                <ul>{ticket.attachments.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
            </div>}
          </div>
          {/* Right Column */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
             <div>
                <h4 className="font-semibold text-gray-600">Créé par</h4>
                <p>{ticket.createdBy.fullName}</p>
                <p className="text-sm text-gray-500">{ticket.createdBy.email}</p>
            </div>
             <div>
                <h4 className="font-semibold text-gray-600">Date de création</h4>
                <p>{new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
             <div>
                <h4 className="font-semibold text-gray-600">Assigné à</h4>
                <p>{ticket.assignedTo?.fullName || 'Non assigné'}</p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-8 pt-4 border-t">
          {canAssign && (
            <div className="flex items-center space-x-2">
              <select value={selectedTechnicianId} onChange={(e) => setSelectedTechnicianId(e.target.value)} className="p-2 border rounded-md w-full">
                <option value="">Sélectionner un technicien</option>
                {technicians.map(tech => <option key={tech.id} value={tech.id}>{tech.fullName}</option>)}
              </select>
              <button onClick={handleAssign} disabled={!selectedTechnicianId} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">Assigner</button>
            </div>
          )}
          {canClose && (
            <button onClick={handleCloseTicket} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Clôturer le ticket</button>
          )}
          {canValidate && (
            <button 
                onClick={handleValidateTicket} 
                disabled={isValidated}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
            >
              {isValidated ? 'Déjà facturé' : 'Valider pour facturation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;