'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

const DoubtsContent = () => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    toast.success('Your question has been submitted!');
    setQuestion('');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-4 rounded-md bg-primary p-4 text-primary-foreground shadow-md">
        <h1 className="text-center text-3xl font-bold">Doubts Corner</h1>
      </header>

      <main className="container mx-auto rounded-md bg-card p-4 text-card-foreground shadow-md">
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Ask a Question</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="question" className="block text-muted-foreground">
                Your Question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full rounded-md border border-border bg-background p-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                rows={4}
                placeholder="Type your question here..."
                maxLength={2000}
                required
              />
              <p className="mt-1 text-sm text-muted-foreground">
                {question.length}/2000 characters
              </p>
            </div>
            <div>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Recent Questions</h2>
          <ul className="space-y-4">
            <li className="rounded-md bg-muted p-4 shadow-md">
              <h3 className="text-xl font-bold">
                How to configure Tailwind CSS with Next.js?
              </h3>
              <p className="text-muted-foreground">
                Asked by Alex R. on 10th Jan 2025
              </p>
            </li>
            <li className="rounded-md bg-muted p-4 shadow-md">
              <h3 className="text-xl font-bold">
                What are the best resources for learning Node.js?
              </h3>
              <p className="text-muted-foreground">
                Asked by Sarah K. on 9th Jan 2025
              </p>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default DoubtsContent;
