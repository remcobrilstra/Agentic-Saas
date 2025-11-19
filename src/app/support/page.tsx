/**
 * User Support Page
 * 
 * Allows users to search FAQ and submit support tickets
 */

'use client';

import React, { useState, useEffect } from 'react';
import { UserLayout } from '@/layouts';
import { Button, Input, Card } from '@/components';
import { SupportService, FAQEntry, FAQSearchResult } from '@/modules/support';
import { useAuth } from '@/contexts';

export default function SupportPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [faqResults, setFaqResults] = useState<FAQSearchResult[]>([]);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQEntry | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all FAQs on mount
  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const faqs = await SupportService.getAllFAQs();
      setFaqResults(faqs.map(entry => ({ entry, relevance: 1 })));
    } catch (err) {
      console.error('Failed to load FAQs:', err);
      setError('Failed to load FAQs');
    }
  };

  const handleSearch = async () => {
    try {
      const results = await SupportService.searchFAQs(searchQuery);
      setFaqResults(results);
      setSelectedFAQ(null);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search FAQs');
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    setSubmitSuccess(false);

    try {
      await SupportService.createTicket(user.id, {
        subject: ticketSubject,
        message: ticketMessage,
      });

      setSubmitSuccess(true);
      setTicketSubject('');
      setTicketMessage('');
      setShowTicketForm(false);

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to submit ticket:', err);
      setError('Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Support Center</h1>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✓ Your support ticket has been submitted successfully. We&apos;ll respond as soon as possible.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* FAQ Search Section */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Search Frequently Asked Questions
          </h2>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* FAQ Results */}
          <div className="space-y-2">
            {faqResults.length > 0 ? (
              faqResults.map(({ entry }) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedFAQ?.id === entry.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedFAQ(selectedFAQ?.id === entry.id ? null : entry)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{entry.question}</h3>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {entry.category}
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedFAQ?.id === entry.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {selectedFAQ?.id === entry.id && (
                    <div className="mt-3 pt-3 border-t border-gray-300 text-gray-700">
                      {entry.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No FAQs found. Try a different search term.
              </p>
            )}
          </div>
        </Card>

        {/* Submit Ticket Section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Still need help?
            </h2>
            {!showTicketForm && (
              <Button onClick={() => setShowTicketForm(true)}>
                Submit a Support Ticket
              </Button>
            )}
          </div>

          {showTicketForm ? (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Brief description of your issue"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Please describe your issue in detail..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowTicketForm(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600">
              Can&apos;t find an answer in the FAQ? Submit a support ticket and our team will get back to you.
            </p>
          )}
        </Card>
      </div>
    </UserLayout>
  );
}
