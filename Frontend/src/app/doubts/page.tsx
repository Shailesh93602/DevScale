import React from 'react';

const Doubts = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-4 rounded-md bg-blue-600 p-4 text-white shadow-md">
        <h1 className="text-center text-3xl font-bold">Doubts Corner</h1>
      </header>

      <main className="container mx-auto rounded-md bg-white p-4 shadow-md">
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Ask a Question</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-gray-700">
                Your Question
              </label>
              <textarea
                id="question"
                className="w-full rounded-md border border-gray-300 p-2"
                rows={4}
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white shadow-md"
              >
                Submit
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Recent Questions</h2>
          <ul className="space-y-4">
            <li className="rounded-md bg-gray-100 p-4 shadow-md">
              <h3 className="text-xl font-bold">
                How to configure Tailwind CSS with Next.js?
              </h3>
              <p className="text-gray-700">
                Asked by John Doe on 10th June 2024
              </p>
            </li>
            <li className="rounded-md bg-gray-100 p-4 shadow-md">
              <h3 className="text-xl font-bold">
                What are the best resources for learning Node.js?
              </h3>
              <p className="text-gray-700">
                Asked by Jane Smith on 9th June 2024
              </p>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Doubts;
