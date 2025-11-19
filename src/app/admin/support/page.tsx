/**
 * Admin Support Page
 * 
 * Allows admins to manage support tickets and FAQs
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts';
import { Button, Input, Card, Modal } from '@/components';
import { 
  SupportService, 
  SupportTicket, 
  FAQEntry,
  SupportTicketStatus 
} from '@/modules/support';
import { useAuth } from '@/contexts';

type TabType = 'tickets' | 'faqs';

export default function AdminSupportPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  
  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [ticketStatus, setTicketStatus] = useState<SupportTicketStatus>('in_progress');
  
  // FAQ state
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQEntry | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('');
  const [faqOrder, setFaqOrder] = useState('0');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'tickets') {
        const ticketData = await SupportService.getAllTickets();
        setTickets(ticketData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      } else {
        const faqData = await SupportService.getAllFAQs();
        setFaqs(faqData);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketResponse(ticket.response || '');
    setTicketStatus(ticket.status);
  };

  const handleRespondToTicket = async () => {
    if (!selectedTicket) return;

    setIsLoading(true);
    setError(null);
    try {
      await SupportService.updateTicket(selectedTicket.id, {
        response: ticketResponse,
        status: ticketStatus,
      });
      
      setSuccessMessage('Response sent successfully');
      setSelectedTicket(null);
      setTicketResponse('');
      await loadData();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to respond to ticket:', err);
      setError('Failed to send response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    setIsLoading(true);
    setError(null);
    try {
      await SupportService.deleteTicket(id);
      setSuccessMessage('Ticket deleted successfully');
      setSelectedTicket(null);
      await loadData();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete ticket:', err);
      setError('Failed to delete ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const openFAQModal = (faq?: FAQEntry) => {
    if (faq) {
      setEditingFAQ(faq);
      setFaqQuestion(faq.question);
      setFaqAnswer(faq.answer);
      setFaqCategory(faq.category);
      setFaqOrder(faq.order_index.toString());
    } else {
      setEditingFAQ(null);
      setFaqQuestion('');
      setFaqAnswer('');
      setFaqCategory('');
      setFaqOrder('0');
    }
    setShowFAQModal(true);
  };

  const handleSaveFAQ = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const faqData = {
        question: faqQuestion,
        answer: faqAnswer,
        category: faqCategory,
        orderIndex: parseInt(faqOrder, 10),
      };

      if (editingFAQ) {
        await SupportService.updateFAQ(editingFAQ.id, faqData);
        setSuccessMessage('FAQ updated successfully');
      } else {
        await SupportService.createFAQ(faqData, user?.id);
        setSuccessMessage('FAQ created successfully');
      }

      setShowFAQModal(false);
      await loadData();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save FAQ:', err);
      setError('Failed to save FAQ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    setIsLoading(true);
    setError(null);
    try {
      await SupportService.deleteFAQ(id);
      setSuccessMessage('FAQ deleted successfully');
      await loadData();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
      setError('Failed to delete FAQ');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: SupportTicketStatus) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Support Management</h1>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✓ {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Support Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'faqs'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            FAQs ({faqs.length})
          </button>
        </div>

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket List */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tickets</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {ticket.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()} at{' '}
                        {new Date(ticket.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No tickets yet</p>
                )}
              </div>
            </Card>

            {/* Ticket Detail & Response */}
            <Card>
              {selectedTicket ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Ticket Details</h2>
                    <Button
                      onClick={() => handleDeleteTicket(selectedTicket.id)}
                      className="bg-red-600 hover:bg-red-700 text-sm"
                    >
                      Delete
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <p className="text-gray-900">{selectedTicket.subject}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedTicket.message}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={ticketStatus}
                        onChange={(e) => setTicketStatus(e.target.value as SupportTicketStatus)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Response
                      </label>
                      <textarea
                        rows={6}
                        value={ticketResponse}
                        onChange={(e) => setTicketResponse(e.target.value)}
                        placeholder="Write your response here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <Button
                      onClick={handleRespondToTicket}
                      disabled={isLoading || !ticketResponse}
                      className="w-full"
                    >
                      {isLoading ? 'Sending...' : 'Send Response'}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select a ticket to view details and respond
                </p>
              )}
            </Card>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button onClick={() => openFAQModal()}>Add New FAQ</Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {faqs.length > 0 ? (
                faqs.map((faq) => (
                  <Card key={faq.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {faq.category}
                          </span>
                          <span className="text-xs text-gray-500">Order: {faq.order_index}</span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => openFAQModal(faq)}
                          className="bg-blue-600 hover:bg-blue-700 text-sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="bg-red-600 hover:bg-red-700 text-sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-gray-500 text-center py-8">No FAQs yet. Create your first one!</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* FAQ Modal */}
        {showFAQModal && (
          <Modal
            isOpen={showFAQModal}
            onClose={() => setShowFAQModal(false)}
            title={editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <Input
                  type="text"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="Enter the question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  rows={4}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Enter the answer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Input
                  type="text"
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  placeholder="e.g., Account, Billing, Technical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <Input
                  type="number"
                  value={faqOrder}
                  onChange={(e) => setFaqOrder(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveFAQ}
                  disabled={isLoading || !faqQuestion || !faqAnswer || !faqCategory}
                >
                  {isLoading ? 'Saving...' : 'Save FAQ'}
                </Button>
                <Button
                  onClick={() => setShowFAQModal(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
