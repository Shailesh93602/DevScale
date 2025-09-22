'use client';
import { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold text-gray-900">Contact Us</h1>

        <p className="mb-6 text-lg text-gray-600">
          Have any questions or feedback? Fill out the form below to get in
          touch with us.
        </p>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-light p-6 shadow"
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-dark focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              rows={5}
              required
            ></textarea>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="focus:shadow-outline rounded bg-indigo-500 px-4 py-2 font-bold text-light hover:bg-indigo-600 focus:outline-none"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
