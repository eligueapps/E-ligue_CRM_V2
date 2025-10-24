
import React from 'react';
import { Ticket, TicketStatus } from '../types';
import { TicketIcon } from './icons';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

const statusStyles: { [key in TicketStatus]: string } = {
  [TicketStatus.Created]: 'bg-blue-100 text-blue-800',
  [TicketStatus.InProgress]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.Closed]: 'bg-gray-200 text-gray-800',
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
             <div className="bg-blue-100 p-2 rounded-full">
                <TicketIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-500">{ticket.serialNumber}</p>
                <h3 className="text-lg font-bold text-gray-800">{ticket.title}</h3>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[ticket.status]}`}>
            {ticket.status}
          </span>
        </div>
        <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
                <span className="font-semibold">Application:</span>
                <span>{ticket.application}</span>
            </div>
            <div className="flex justify-between">
                <span className="font-semibold">Demandeur:</span>
                <span>{ticket.createdBy.fullName}</span>
            </div>
             <div className="flex justify-between">
                <span className="font-semibold">Date de création:</span>
                <span>{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            {ticket.assignedTo && (
                 <div className="flex justify-between">
                    <span className="font-semibold">Assigné à:</span>
                    <span className="font-bold">{ticket.assignedTo.fullName}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
