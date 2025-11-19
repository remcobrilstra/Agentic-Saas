/**
 * Support Service
 * 
 * Provides utilities to manage support tickets and FAQ entries
 */

import { getConfig } from '@/abstractions/config';
import {
  SupportTicket,
  CreateSupportTicketParams,
  UpdateSupportTicketParams,
  FAQEntry,
  CreateFAQEntryParams,
  UpdateFAQEntryParams,
  FAQSearchResult,
} from './types';

export class SupportService {
  /**
   * Get all support tickets (admin view)
   */
  static async getAllTickets(): Promise<SupportTicket[]> {
    const { database } = getConfig().providers;
    return database.query<SupportTicket>('support_tickets');
  }

  /**
   * Get support tickets for a specific user
   */
  static async getUserTickets(userId: string): Promise<SupportTicket[]> {
    const { database } = getConfig().providers;
    return database.query<SupportTicket>('support_tickets', { userId });
  }

  /**
   * Get a single support ticket by ID
   */
  static async getTicketById(id: string): Promise<SupportTicket | null> {
    const { database } = getConfig().providers;
    return database.getById<SupportTicket>('support_tickets', id);
  }

  /**
   * Create a new support ticket
   */
  static async createTicket(
    userId: string,
    params: CreateSupportTicketParams
  ): Promise<SupportTicket> {
    const { database } = getConfig().providers;
    return database.insert<SupportTicket>('support_tickets', {
      userId,
      subject: params.subject,
      message: params.message,
      status: 'open',
    });
  }

  /**
   * Update a support ticket (admin only)
   */
  static async updateTicket(
    id: string,
    params: UpdateSupportTicketParams
  ): Promise<SupportTicket> {
    const { database } = getConfig().providers;
    const updateData: Partial<SupportTicket> = { ...params };
    
    // If adding a response, set respondedAt timestamp
    if (params.response && !params.status) {
      updateData.respondedAt = new Date();
      updateData.status = 'in_progress';
    }
    
    return database.update<SupportTicket>('support_tickets', id, updateData);
  }

  /**
   * Delete a support ticket
   */
  static async deleteTicket(id: string): Promise<void> {
    const { database } = getConfig().providers;
    await database.delete('support_tickets', id);
  }

  /**
   * Get all FAQ entries
   */
  static async getAllFAQs(): Promise<FAQEntry[]> {
    const { database } = getConfig().providers;
    const faqs = await database.query<FAQEntry>('faq_entries');
    
    // Sort by category and order_index
    return faqs.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.orderIndex - b.orderIndex;
    });
  }

  /**
   * Get FAQ entries by category
   */
  static async getFAQsByCategory(category: string): Promise<FAQEntry[]> {
    const { database } = getConfig().providers;
    const faqs = await database.query<FAQEntry>('faq_entries', { category });
    
    // Sort by order_index
    return faqs.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  /**
   * Get a single FAQ entry by ID
   */
  static async getFAQById(id: string): Promise<FAQEntry | null> {
    const { database } = getConfig().providers;
    return database.getById<FAQEntry>('faq_entries', id);
  }

  /**
   * Search FAQ entries
   */
  static async searchFAQs(query: string): Promise<FAQSearchResult[]> {
    const { database } = getConfig().providers;
    const allFAQs = await database.query<FAQEntry>('faq_entries');
    
    if (!query || query.trim() === '') {
      return allFAQs.map(entry => ({ entry, relevance: 1 }));
    }
    
    const lowerQuery = query.toLowerCase().trim();
    const searchTerms = lowerQuery.split(/\s+/);
    
    // Calculate relevance score for each FAQ
    const results = allFAQs.map(entry => {
      const questionLower = entry.question.toLowerCase();
      const answerLower = entry.answer.toLowerCase();
      let relevance = 0;
      
      // Exact match in question
      if (questionLower.includes(lowerQuery)) {
        relevance += 10;
      }
      
      // Exact match in answer
      if (answerLower.includes(lowerQuery)) {
        relevance += 5;
      }
      
      // Individual term matches
      searchTerms.forEach(term => {
        if (questionLower.includes(term)) {
          relevance += 3;
        }
        if (answerLower.includes(term)) {
          relevance += 1;
        }
      });
      
      return { entry, relevance };
    });
    
    // Filter out entries with no relevance and sort by relevance
    return results
      .filter(result => result.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Create a new FAQ entry
   */
  static async createFAQ(
    params: CreateFAQEntryParams,
    createdBy?: string
  ): Promise<FAQEntry> {
    const { database } = getConfig().providers;
    return database.insert<FAQEntry>('faq_entries', {
      question: params.question,
      answer: params.answer,
      category: params.category,
      orderIndex: params.orderIndex ?? 0,
      createdBy,
    });
  }

  /**
   * Update a FAQ entry
   */
  static async updateFAQ(
    id: string,
    params: UpdateFAQEntryParams
  ): Promise<FAQEntry> {
    const { database } = getConfig().providers;
    return database.update<FAQEntry>('faq_entries', id, params);
  }

  /**
   * Delete a FAQ entry
   */
  static async deleteFAQ(id: string): Promise<void> {
    const { database } = getConfig().providers;
    await database.delete('faq_entries', id);
  }

  /**
   * Get unique FAQ categories
   */
  static async getFAQCategories(): Promise<string[]> {
    const { database } = getConfig().providers;
    const faqs = await database.query<FAQEntry>('faq_entries');
    
    const categories = new Set(faqs.map(faq => faq.category));
    return Array.from(categories).sort();
  }
}
