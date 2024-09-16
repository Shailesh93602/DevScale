import React from "react";

const Doubts = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 rounded-md shadow-md mb-4">
        <h1 className="text-3xl font-bold text-center">Doubts Corner</h1>
      </header>

      <main className="container mx-auto p-4 bg-white rounded-md shadow-md">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ask a Question</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-gray-700">
                Your Question
              </label>
              <textarea
                id="question"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="4"
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
              >
                Submit
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Recent Questions</h2>
          <ul className="space-y-4">
            <li className="p-4 bg-gray-100 rounded-md shadow-md">
              <h3 className="text-xl font-bold">
                How to configure Tailwind CSS with Next.js?
              </h3>
              <p className="text-gray-700">
                Asked by John Doe on 10th June 2024
              </p>
            </li>
            <li className="p-4 bg-gray-100 rounded-md shadow-md">
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
