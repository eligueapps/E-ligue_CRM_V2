import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Role, Ticket, User, TicketStatus, Invoice } from '../types';
import Header from '../components/Header';
import TicketCard from '../components/TicketCard';
import TicketDetailsModal from '../components/TicketDetailsModal';
import TicketFormModal from '../components/TicketFormModal';
import { PlusIcon, UsersIcon, InvoiceIcon, TicketIcon, PencilIcon, TrashIcon, ChartBarIcon } from '../components/icons';
import UserFormModal from '../components/UserFormModal';
import InvoiceTemplate from '../components/InvoiceTemplate';

const DashboardPage: React.FC = () => {
    const { currentUser } = useAppContext();

    return (
        <div className="min-h-screen bg-slate-100">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {currentUser?.role === Role.Admin && <AdminDashboard />}
                {currentUser?.role === Role.Technician && <TechnicianDashboard />}
                {currentUser?.role === Role.User && <UserDashboard />}
            </main>
        </div>
    );
};


// User View
const UserDashboard: React.FC = () => {
    const { currentUser, tickets } = useAppContext();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);

    const userTickets = useMemo(() =>
        tickets.filter(t => t.createdBy.id === currentUser?.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        [tickets, currentUser]
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Mes Tickets</h2>
                <button onClick={() => setIsCreatingTicket(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
                    <PlusIcon className="h-5 w-5" />
                    Créer un Ticket
                </button>
            </div>
            <TicketList tickets={userTickets} onTicketClick={setSelectedTicket} />
            {selectedTicket && <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
            {isCreatingTicket && <TicketFormModal onClose={() => setIsCreatingTicket(false)} />}
        </div>
    );
};


// Technician View
const TechnicianDashboard: React.FC = () => {
    return <TechnicianTicketView />;
};

const TechnicianTicketView: React.FC = () => {
    const { currentUser, tickets } = useAppContext();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const assignedTickets = useMemo(() =>
        tickets.filter(t => t.assignedTo?.id === currentUser?.id && t.status !== TicketStatus.Closed)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
        [tickets, currentUser]
    );
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Mes Tickets Assignés</h2>
            <TicketList tickets={assignedTickets} onTicketClick={setSelectedTicket} />
            {selectedTicket && <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
        </div>
    );
};

const TechnicianSummaryView: React.FC = () => {
    const { users, tickets } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');

    const technicians = useMemo(() => users.filter(u => u.role === Role.Technician), [users]);

    const summaryData = useMemo(() => {
        const data = technicians.map(tech => {
            const assignedTickets = tickets.filter(t => t.assignedTo?.id === tech.id);
            const inProgressTickets = assignedTickets.filter(t => t.status === TicketStatus.InProgress).length;
            const closedTickets = assignedTickets.filter(t => t.status === TicketStatus.Closed).length;
            const totalTickets = assignedTickets.length;

            return {
                id: tech.id,
                login: tech.login,
                fullName: tech.fullName,
                totalTickets,
                inProgressTickets,
                closedTickets,
            };
        });

        // Sort by closed tickets desc, then total tickets desc
        data.sort((a, b) => {
            if (b.closedTickets !== a.closedTickets) {
                return b.closedTickets - a.closedTickets;
            }
            return b.totalTickets - a.totalTickets;
        });
        
        // Assign rank with ties
        let rank = 0;
        let lastClosed = -1;
        let lastTotal = -1;
        return data.map((item, index) => {
            if (item.closedTickets !== lastClosed || item.totalTickets !== lastTotal) {
                rank = index + 1;
                lastClosed = item.closedTickets;
                lastTotal = item.totalTickets;
            }
            return {...item, rank };
        });

    }, [technicians, tickets]);

    const filteredSummary = useMemo(() => {
        if (!searchQuery) return summaryData;
        const query = searchQuery.toLowerCase();
        return summaryData.filter(tech =>
            tech.fullName.toLowerCase().includes(query) ||
            tech.login.toLowerCase().includes(query)
        );
    }, [summaryData, searchQuery]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Bilan des Tickets par Technicien</h2>
            
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <input
                    type="text"
                    placeholder="Filtrer par nom ou code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    aria-label="Filtrer les techniciens"
                />
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rang</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technicien</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Assignés</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">En Cours</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Clôturés</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSummary.map(tech => (
                            <tr key={tech.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-lg">{tech.rank}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-base">{tech.fullName}</div>
                                    <div className="text-sm text-gray-500">{tech.login}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-lg">{tech.totalTickets}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-lg text-yellow-600">{tech.inProgressTickets}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-lg text-green-600">{tech.closedTickets}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredSummary.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Aucun technicien correspondant au filtre.</p>
                )}
            </div>
        </div>
    );
};


// Admin View
const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'tickets' | 'users' | 'invoices' | 'summary'>('tickets');

    return (
        <div>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('tickets')} className={`${activeTab === 'tickets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        <TicketIcon className="h-5 w-5"/> Tous les Tickets
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        <UsersIcon className="h-5 w-5"/> Gérer les Utilisateurs
                    </button>
                    <button onClick={() => setActiveTab('invoices')} className={`${activeTab === 'invoices' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                       <InvoiceIcon className="h-5 w-5"/> Factures d'Intervention
                    </button>
                    <button onClick={() => setActiveTab('summary')} className={`${activeTab === 'summary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                       <ChartBarIcon className="h-5 w-5"/> Bilan des Techniciens
                    </button>
                </nav>
            </div>
            <div>
                {activeTab === 'tickets' && <AdminTicketView />}
                {activeTab === 'users' && <AdminUserView />}
                {activeTab === 'invoices' && <AdminInvoiceView />}
                {activeTab === 'summary' && <TechnicianSummaryView />}
            </div>
        </div>
    );
};

const AdminTicketView = () => {
    const { tickets } = useAppContext();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredTickets = useMemo(() => {
        return [...tickets]
            .filter(ticket => {
                const ticketDate = new Date(ticket.createdAt);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if (start && ticketDate < start) return false;
                if (end) {
                    end.setHours(23, 59, 59, 999); // Include the whole end day
                    if (ticketDate > end) return false;
                }
                
                const query = searchQuery.toLowerCase();
                return ticket.serialNumber.toLowerCase().includes(query) || ticket.title.toLowerCase().includes(query);
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [tickets, searchQuery, startDate, endDate]);


    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Tous les Tickets</h2>
            
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center gap-4">
                <input
                    type="text"
                    placeholder="Rechercher par N° ou titre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow p-2 border rounded-md"
                    aria-label="Rechercher des tickets"
                />
                <div className="flex items-center gap-2">
                    <label htmlFor="start-date-ticket" className="text-sm font-medium text-gray-700">Du</label>
                    <input
                        type="date"
                        id="start-date-ticket"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border rounded-md"
                        aria-label="Date de début"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="end-date-ticket" className="text-sm font-medium text-gray-700">Au</label>
                    <input
                        type="date"
                        id="end-date-ticket"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border rounded-md"
                        aria-label="Date de fin"
                    />
                </div>
            </div>

            <TicketList tickets={filteredTickets} onTicketClick={setSelectedTicket} />
            {selectedTicket && <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
        </div>
    );
};

const AdminUserView = () => {
    const { users, deleteUser } = useAppContext();
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleAdd = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-slate-800">Gestion des Utilisateurs</h2>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
                    <PlusIcon className="h-5 w-5" /> Ajouter un Utilisateur
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Complet</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entité</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.entity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {isUserModalOpen && <UserFormModal user={editingUser} onClose={() => setIsUserModalOpen(false)} />}
        </div>
    );
};

const AdminInvoiceView = () => {
    const { invoices, tickets } = useAppContext();
    const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredInvoices = useMemo(() => {
        return invoices
            .filter(invoice => {
                const invoiceDate = new Date(invoice.date);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if (start && invoiceDate < start) return false;
                if (end) {
                    end.setHours(23, 59, 59, 999);
                    if (invoiceDate > end) return false;
                }

                return invoice.ticketSerialNumber.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoices, searchQuery, startDate, endDate]);

    const ticketForInvoice = invoiceToPrint ? tickets.find(t => t.id === invoiceToPrint.ticketId) : null;
    
    const handlePrintList = () => {
        window.print();
    };

    return (
         <div id="invoice-list-printable">
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h2 className="text-3xl font-bold text-slate-800">Factures d'Intervention</h2>
                 <button
                    onClick={handlePrintList}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition print:hidden"
                >
                    Imprimer la liste
                </button>
            </div>
            
             <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center gap-4 print:hidden">
                <input
                    type="text"
                    placeholder="Rechercher par N° de ticket..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow p-2 border rounded-md"
                    aria-label="Rechercher des factures"
                />
                <div className="flex items-center gap-2">
                    <label htmlFor="start-date-invoice" className="text-sm font-medium text-gray-700">Du</label>
                    <input
                        type="date"
                        id="start-date-invoice"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border rounded-md"
                        aria-label="Date de début de facturation"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="end-date-invoice" className="text-sm font-medium text-gray-700">Au</label>
                    <input
                        type="date"
                        id="end-date-invoice"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border rounded-md"
                        aria-label="Date de fin de facturation"
                    />
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Ticket</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technicien</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInvoices.map(invoice => (
                            <tr key={invoice.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-600">{invoice.ticketSerialNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{invoice.technicianName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{invoice.amount.toFixed(2)} DH</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right print:hidden">
                                    <button onClick={() => setEditingInvoice(invoice)} className="text-indigo-600 hover:text-indigo-900 mr-4" aria-label="Modifier le montant">
                                        <PencilIcon className="h-5 w-5"/>
                                    </button>
                                    <button onClick={() => setInvoiceToPrint(invoice)} className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                                        Imprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredInvoices.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Aucune facture ne correspond aux critères de recherche.</p>
                )}
            </div>
            {editingInvoice && (
                <InvoiceEditModal
                    invoice={editingInvoice}
                    onClose={() => setEditingInvoice(null)}
                />
            )}
            {invoiceToPrint && ticketForInvoice && (
                <InvoiceTemplate
                    invoice={invoiceToPrint}
                    ticket={ticketForInvoice}
                    onPrintComplete={() => setInvoiceToPrint(null)}
                />
            )}
        </div>
    )
}

// Common component
const TicketList: React.FC<{ tickets: Ticket[], onTicketClick: (ticket: Ticket) => void }> = ({ tickets, onTicketClick }) => {
    if (tickets.length === 0) {
        return <p className="text-center text-gray-500 mt-8">Aucun ticket à afficher.</p>;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} onClick={() => onTicketClick(ticket)} />
            ))}
        </div>
    );
};

interface InvoiceEditModalProps {
  invoice: Invoice;
  onClose: () => void;
}
const InvoiceEditModal: React.FC<InvoiceEditModalProps> = ({ invoice, onClose }) => {
  const { updateInvoiceAmount } = useAppContext();
  const [amount, setAmount] = useState(invoice.amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAmount = parseFloat(String(amount));
    if (!isNaN(newAmount) && newAmount >= 0) {
      updateInvoiceAmount(invoice.id, newAmount);
      onClose();
    } else {
        alert("Veuillez entrer un montant valide.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Modifier le montant de la facture</h2>
          <p className="text-sm text-gray-600 mb-2">Facture pour le ticket: <span className="font-semibold">{invoice.ticketSerialNumber}</span></p>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Montant (DH)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
               <input
                type="number"
                name="amount"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">DH</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Annuler</button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;