'use client'

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseService';

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
      const cleanEmail = email.trim().toLowerCase();

      // Check if email already exists in newsletter_subscribers
      const { data: existing, error: findError } = await supabase
        .from('newsletter_subscribers')
        .select('id, status')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (findError) {
        throw findError;
      }

      if (existing) {
        if (existing.status === 'subscribed') {
          setStatus('success');
          setMessage('You are already subscribed!');
          setEmail('');
          return;
        } else {
          // Resubscribe
          const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({ status: 'subscribed' })
            .eq('id', existing.id);

          if (updateError) throw updateError;

          setStatus('success');
          setMessage('Thank you for subscribing again!');
          setEmail('');
          return;
        }
      }

      // Insert new subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: cleanEmail, status: 'subscribed' }]);

      if (insertError) {
        if (insertError.code === '23505') {
          setStatus('success');
          setMessage('You are already subscribed!');
          setEmail('');
          return;
        }
        throw insertError;
      }

      setStatus('success');
      setMessage('Thank you for subscribing to Lurevi!');
      setEmail('');
    } catch (error: any) {
      console.error('Newsletter submit error:', error);
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
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
