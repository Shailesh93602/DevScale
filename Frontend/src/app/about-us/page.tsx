import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 text-lg">
            Our mission is to empower individuals by providing them with the
            tools and resources they need to excel in their engineering careers.
            We strive to create a supportive and collaborative environment where
            learners can grow and achieve their goals.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Our History
          </h2>
          <p className="text-gray-600 text-lg">
            Founded in [Year], our website has grown to become a trusted
            platform for engineering professionals and students. Over the years,
            we have helped thousands of individuals enhance their skills and
            advance their careers through our comprehensive resources and
            community support.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Our Team
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-light rounded-lg shadow p-6">
              <Image
                src="/team/member1.jpg"
                alt="Team Member 1"
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                John Doe
              </h3>
              <p className="text-gray-600 text-center">CEO & Founder</p>
            </div>
            <div className="bg-light rounded-lg shadow p-6">
              <Image
                src="/team/member2.jpg"
                alt="Team Member 2"
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                Jane Smith
              </h3>
              <p className="text-gray-600 text-center">CTO</p>
            </div>
            <div className="bg-light rounded-lg shadow p-6">
              <Image
                src="/team/member3.jpg"
                alt="Team Member 3"
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                Sam Johnson
              </h3>
              <p className="text-gray-600 text-center">Lead Developer</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
