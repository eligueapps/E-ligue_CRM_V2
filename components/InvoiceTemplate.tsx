import React, { useEffect } from 'react';
import { Invoice, Ticket } from '../types';

interface InvoiceTemplateProps {
    invoice: Invoice;
    ticket: Ticket;
    onPrintComplete: () => void;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, ticket, onPrintComplete }) => {
    useEffect(() => {
        const handleAfterPrint = () => {
            onPrintComplete();
        };

        window.addEventListener('afterprint', handleAfterPrint);
        
        const timer = setTimeout(() => {
            window.print();
        }, 100);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [onPrintComplete]);

    return (
        <div id="printable-invoice" className="p-12 font-sans text-gray-800 bg-white">
            <div className="flex justify-between items-start pb-8 border-b-2 border-gray-800">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">E-LIGUE Assistance</h1>
                    <p className="text-lg text-gray-600">Service de Support Technique</p>
                </div>
                <h2 className="text-3xl font-bold text-blue-600 uppercase">Facture d'intervention</h2>
            </div>

            <div className="flex justify-between mt-8">
                <div>
                    <p><strong>Date de facturation:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
                    <p><strong>Numéro de facture:</strong> {invoice.id.toUpperCase()}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-700">Ticket de support</p>
                    <p className="font-bold text-lg text-gray-900">{invoice.ticketSerialNumber}</p>
                </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-700 border-b pb-2 mb-2">Client</h3>
                    <p><strong>Entité:</strong> {ticket.createdBy.entity}</p>
                    <p><strong>Nom:</strong> {ticket.createdBy.fullName}</p>
                    <p><strong>Email:</strong> {ticket.createdBy.email}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-700 border-b pb-2 mb-2">Technicien</h3>
                    <p><strong>Nom:</strong> {invoice.technicianName}</p>
                    <p><strong>Intervention sur le ticket:</strong> {ticket.serialNumber}</p>
                </div>
            </div>

            <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">Détails de l'intervention</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                    <p><strong>Application:</strong> {ticket.application}</p>
                    <p className="mt-2"><strong>Titre:</strong> {ticket.title}</p>
                    <p className="mt-2"><strong>Description du problème:</strong></p>
                    <p className="text-gray-600 pl-4 mt-1">{ticket.description}</p>
                </div>
            </div>
            
            <div className="mt-10">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="p-3">Description</th>
                            <th className="p-3 text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-3">Forfait intervention de support technique pour le ticket {ticket.serialNumber}</td>
                            <td className="p-3 text-right">{invoice.amount.toFixed(2)} DH</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-4">
                <div className="w-1/3">
                    <div className="flex justify-between p-3 bg-gray-200 rounded-lg">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-lg">{invoice.amount.toFixed(2)} DH</span>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center text-gray-500 text-sm border-t pt-6">
                <p>Merci de votre confiance.</p>
                <p>E-LIGUE – 123 Rue de la République, 75001 Paris, France</p>
            </div>
        </div>
    );
};

export default InvoiceTemplate;