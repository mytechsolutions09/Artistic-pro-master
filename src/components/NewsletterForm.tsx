'use client'

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Thank you for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter submit error:', error);
      setStatus('error');
      setMessage('Failed to connect to the server. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-stretch gap-2">
        <div className="relative flex-grow">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={status === 'loading'}
            className="w-full h-11 px-4 text-sm bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-gray-400 transition-all disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="h-11 px-6 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 text-xs font-semibold uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-all duration-250 cursor-pointer select-none"
        >
          {status === 'loading' ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              Subscribe
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {status === 'success' && (
        <div className="mt-3 flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md p-3 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-3 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default NewsletterForm;
