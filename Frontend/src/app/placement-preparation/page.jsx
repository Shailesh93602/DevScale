import Image from 'next/image';

export default function PlacementPreparation() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Placement Preparation</h1>
        
        <div className="bg-light rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Practice Tests</h2>
          <Image src="/placement-preparation.svg" alt="Practice Tests" width={550} height={310} />
          <p className="mt-4 text-gray-600">
            Take a variety of practice tests to prepare for your placement exams. These tests cover different subjects and topics that are commonly seen in placement exams.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-light rounded hover:bg-indigo-700">
            Start Practice Tests
          </button>
        </div>

        <div className="bg-light rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Interview Tips</h2>
          <p className="text-gray-600">
            Learn about the best strategies and tips to succeed in interviews. From understanding the company culture to practicing common questions, we’ve got you covered.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-light rounded hover:bg-indigo-700">
            Read Interview Tips
          </button>
        </div>

        <div className="bg-light rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resume Building</h2>
          <p className="text-gray-600">
            Create a professional resume that stands out. Use our resume building tools and templates to highlight your skills and experiences effectively.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-light rounded hover:bg-indigo-700">
            Build Your Resume
          </button>
        </div>

        <div className="bg-light rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Common Interview Questions</h2>
          <p className="text-gray-600">
            Prepare for your interviews by practicing answers to the most common interview questions. This will help you to articulate your thoughts and experiences clearly.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-light rounded hover:bg-indigo-700">
            View Questions
          </button>
        </div>
      </div>
    </div>
  );
}
