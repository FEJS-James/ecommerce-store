'use client';

import { useState } from 'react';

interface EmailSignupProps {
  source?: string;
  leadMagnet?: string;
  className?: string;
  compact?: boolean;
}

export default function EmailSignup({ source = 'website', leadMagnet, className = '', compact = false }: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source, lead_magnet: leadMagnet }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You\'re in! Check your email.');
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-6 text-center ${className}`}>
        <p className="text-green-800 font-medium text-lg">🎉 {message}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
        {status === 'error' && <p className="text-red-500 text-sm mt-1">{message}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'Subscribing...' : 'Get Free Resources →'}
      </button>
      {status === 'error' && <p className="text-red-500 text-sm">{message}</p>}
    </form>
  );
}
