import { redirect } from 'next/navigation';

// The old moderation table read only APPROVED articles, posted a body the API rejects and was
// public. /moderate is the role-gated queue that works, so the old URL lands there.
export default function ArticleListingPage() {
  redirect('/moderate');
}
