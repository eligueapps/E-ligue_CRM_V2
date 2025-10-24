
export enum Role {
  Admin = 'Admin',
  Technician = 'Technicien',
  User = 'Utilisateur',
}

export enum TicketStatus {
  Created = 'Créé',
  InProgress = 'En cours de traitement',
  Closed = 'Clôturé',
}

export interface User {
  id: string;
  login: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  entity: string;
  position: string;
  applications: string[];
  role: Role;
}

export interface Ticket {
  id: string;
  serialNumber: string;
  title: string;
  application: string;
  location: string;
  description: string;
  attachments: File[];
  status: TicketStatus;
  createdAt: Date;
  createdBy: User;
  assignedTo?: User;
}

export interface Invoice {
  id: string;
  ticketId: string;
  ticketSerialNumber: string;
  technicianName: string;
  date: Date;
  amount: number;
}
