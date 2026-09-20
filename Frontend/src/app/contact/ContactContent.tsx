'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { BRANDING } from '@/constants';
import { buildContactMailto } from '@/lib/contact-mailto';

export default function ContactContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 🔴 This used to `await` a one-second timer with the comment "Simulate API
   * call", then fire `toast.success('Message sent!')` and clear the form.
   * There was no request. Every message was discarded while the visitor was
   * told it had been delivered.
   *
   * There is no public contact endpoint to post to — `POST /support/tickets`
   * requires a session and this page exists for people who do not have one —
   * so the form hands off to the visitor's mail client, the same way the
   * pricing page's Team plan already does.
   *
   * The fields are NOT cleared. If the mail client does not open (some
   * browsers and locked-down desktops swallow `mailto:` entirely) the visitor
   * still has what they wrote and the address to send it to is on this page.
   * Clearing them would recreate the original bug in a new costume.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      window.location.href = buildContactMailto({
        to: BRANDING.contactEmail,
        name,
        email,
        message,
      });
      toast.info(
        `Opening your email app to send this to ${BRANDING.contactEmail}.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="from-primary/10 to-primary/10 mb-10 rounded-2xl border border-border bg-gradient-to-r via-background p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Let&apos;s connect
          </p>
          <h1 className="mt-2 text-4xl font-bold text-foreground">
            Contact Us
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            Have any questions or feedback? Fill out the form below to get in
            touch with us.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold text-foreground">Email</h2>
              <p className="mt-2 text-muted-foreground">
                {BRANDING.contactEmail}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold text-foreground">
                Response time
              </h2>
              <p className="mt-2 text-muted-foreground">
                We typically reply within 24 hours on business days.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2"
          >
            <div className="mb-4">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-bold text-foreground"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-foreground"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-bold text-foreground"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                rows={5}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={isSubmitting} className="px-8">
                {isSubmitting ? 'Opening…' : 'Send Message'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
