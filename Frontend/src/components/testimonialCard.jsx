import React from 'react';

export default function TestimonialCard({ text, name }) {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
      <p className="text-gray-700 italic mb-4">&quot;{text}&quot;</p>
      <p className="font-bold text-gray-900">- {name}</p>
    </div>
  );
}
