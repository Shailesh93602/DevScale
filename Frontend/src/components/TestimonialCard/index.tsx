import React from 'react';

export default function TestimonialCard({
  text,
  name,
}: {
  text: string;
  name: string;
}) {
  return (
    <div className="rounded-lg bg-gray-100 p-6 shadow-lg">
      <p className="mb-4 italic text-gray-700">&quot;{text}&quot;</p>
      <p className="font-bold text-gray-900">- {name}</p>
    </div>
  );
}
