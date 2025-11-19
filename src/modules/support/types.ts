/**
 * Support Module Types
 */

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  response?: string | null;
  responded_at?: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
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
  order_index: number;
  created_by?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
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
