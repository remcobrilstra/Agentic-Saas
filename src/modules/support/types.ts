/**
 * Support Module Types
 */

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  response?: string | null;
  respondedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupportTicketParams {
  subject: string;
  message: string;
}

export interface UpdateSupportTicketParams {
  status?: SupportTicketStatus;
  response?: string;
}

export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFAQEntryParams {
  question: string;
  answer: string;
  category: string;
  orderIndex?: number;
}

export interface UpdateFAQEntryParams {
  question?: string;
  answer?: string;
  category?: string;
  orderIndex?: number;
}

export interface FAQSearchResult {
  entry: FAQEntry;
  relevance: number;
}
