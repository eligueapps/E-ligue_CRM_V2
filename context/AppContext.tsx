import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, Ticket, Invoice, Role, TicketStatus } from '../types';
import { MOCK_USERS, MOCK_TICKETS, MOCK_INVOICES, E_LIGUE_APPLICATIONS } from '../constants';

interface AppContextType {
  users: User[];
  tickets: Ticket[];
  invoices: Invoice[];
  currentUser: User | null;
  technicians: User[];
  applications: string[];
  login: (login: string, password: string) => boolean;
  logout: () => void;
  addTicket: (ticketData: Omit<Ticket, 'id' | 'serialNumber' | 'status' | 'createdAt' | 'createdBy'>) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  validateTicket: (ticket: Ticket) => boolean;
  updateInvoiceAmount: (invoiceId: string, newAmount: number) => void;
  addApplication: (appName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<string[]>(E_LIGUE_APPLICATIONS);


  const technicians = users.filter(u => u.role === Role.Technician);

  const login = useCallback((loginValue: string, passwordValue: string): boolean => {
    const user = users.find(u => u.login === loginValue && u.password === passwordValue);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const logout = () => {
    setCurrentUser(null);
  };

  const addTicket = (ticketData: Omit<Ticket, 'id' | 'serialNumber' | 'status' | 'createdAt' | 'createdBy'>) => {
    if (!currentUser) return;
    const newTicket: Ticket = {
      ...ticketData,
      id: `ticket-${Date.now()}`,
      serialNumber: `TI-${String(tickets.length + 1).padStart(4, '0')}`,
      status: TicketStatus.Created,
      createdAt: new Date(),
      createdBy: currentUser,
    };
    setTickets(prev => [...prev, newTicket]);
  };

  const updateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, ...updates } : t)));
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };
    
  const validateTicket = (ticket: Ticket): boolean => {
    const invoiceExists = invoices.some(inv => inv.ticketId === ticket.id);
    if (invoiceExists) {
        return false; // Indicate that invoice already exists
    }

    if (!ticket.assignedTo) return false;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      ticketId: ticket.id,
      ticketSerialNumber: ticket.serialNumber,
      technicianName: ticket.assignedTo.fullName,
      date: new Date(),
      amount: Math.floor(Math.random() * (150 - 50 + 1)) + 50, // Random amount between 50 and 150
    };
    setInvoices(prev => [...prev, newInvoice]);
    return true; // Indicate success
  };

  const updateInvoiceAmount = (invoiceId: string, newAmount: number) => {
    setInvoices(prev => prev.map(inv => (inv.id === invoiceId ? { ...inv, amount: newAmount } : inv)));
  };

  const addApplication = (appName: string) => {
    if (appName && !applications.includes(appName)) {
      setApplications(prev => [...prev, appName].sort());
    }
  };

  const value = {
    users,
    tickets,
    invoices,
    currentUser,
    technicians,
    applications,
    login,
    logout,
    addTicket,
    updateTicket,
    addUser,
    updateUser,
    deleteUser,
    validateTicket,
    updateInvoiceAmount,
    addApplication,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};