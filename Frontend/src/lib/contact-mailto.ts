/**
 * Build the `mailto:` URL the contact form submits to.
 *
 * WHY THIS EXISTS.
 *
 * `/contact`'s submit handler was:
 *
 *     // Simulate API call
 *     await new Promise((resolve) => setTimeout(resolve, 1000));
 *     toast.success('Message sent! We will get back to you soon.');
 *
 * No fetch, no axios, no endpoint — a one-second timer and then a success
 * toast. Every message anyone ever typed into that form was discarded, while
 * the page told them it had been sent and the card beside it promised a reply
 * "within 24 hours on business days". That is worse than a broken form: a
 * broken form gets reported, and this one silently ate real inbound mail.
 *
 * There is no public contact endpoint to wire it to — `POST /support/tickets`
 * is authenticated, and `/contact` is a page for people who do not have an
 * account yet. So the form does what the pricing page's Team plan already
 * does: hands off to the visitor's mail client. It is honest, it needs no
 * backend, and the message ends up somewhere a human reads.
 *
 * It is a separate pure function, and not inline in the component, so the
 * escaping can be tested for real rather than by rendering the form and
 * declaring victory.
 */
export function buildContactMailto(input: {
  to: string;
  name: string;
  email: string;
  message: string;
}): string {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  const subject = name
    ? `EduScale contact form — ${name}`
    : 'EduScale contact form';

  // The sender's address goes in the BODY as well as (implicitly) the From
  // header, because whichever client opens this may send from a different
  // account than the one they typed.
  const body = [`Name: ${name}`, `Email: ${email}`, '', message].join('\n');

  // encodeURIComponent, not encodeURI: the latter leaves `&`, `?` and `#`
  // intact, so a message containing "A & B" would truncate the body at the
  // ampersand and silently drop everything the visitor wrote after it —
  // reintroducing the exact failure this function was written to end.
  return `mailto:${encodeURIComponent(input.to)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}
