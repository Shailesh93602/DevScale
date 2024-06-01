import React from 'react';

const icons = {
  test: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-12 h-12 text-blue-600 mb-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12h.01M19 12h.01M4 6h16M4 18h16m-8-6h.01M9 12h.01M7 12h.01M5 12h.01M12 12h.01M12 6h.01M12 18h.01"
      />
    </svg>
  ),
  roadmap: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-12 h-12 text-blue-600 mb-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 20l-5.447-2.724A2 2 0 012 15.382V6.618a2 2 0 011.553-1.894L9 2m0 18l5.447 2.724A2 2 0 0018 17.618V8.382a2 2 0 00-1.553-1.894L9 2m0 18V2"
      />
    </svg>
  ),
  placement: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-12 h-12 text-blue-600 mb-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 11c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0-2V7h2V5h-2V3H8v2H6v2h2v2h2zM8 9v6m-4 4h8"
      />
    </svg>
  ),
};

export default function ResourceCard({ title, description, icon }) {
  return (
    <div className="bg-light p-6 rounded-lg shadow-lg text-center">
      {icons[icon]}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}
