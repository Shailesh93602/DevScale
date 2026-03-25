import Image from 'next/image';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold text-gray-900">About Us</h1>

        <section className="mb-12">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600">
            Our mission is to empower individuals by providing them with the
            tools and resources they need to excel in their engineering careers.
            We strive to create a supportive and collaborative environment where
            learners can grow and achieve their goals.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800">
            Our History
          </h2>
          <p className="text-lg text-gray-600">
            Founded in [Year], our website has grown to become a trusted
            platform for engineering professionals and students. Over the years,
            we have helped thousands of individuals enhance their skills and
            advance their careers through our comprehensive resources and
            community support.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-3xl font-semibold text-gray-800">
            Our Team
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-light p-6 shadow">
              <Image
                src="/team/member1.jpg"
                alt="Team Member 1"
                className="mx-auto mb-4 h-32 w-32 rounded-full"
              />
              <h3 className="text-center text-xl font-semibold text-gray-800">
                John Doe
              </h3>
              <p className="text-center text-gray-600">CEO & Founder</p>
            </div>
            <div className="rounded-lg bg-light p-6 shadow">
              <Image
                src="/team/member2.jpg"
                alt="Team Member 2"
                className="mx-auto mb-4 h-32 w-32 rounded-full"
              />
              <h3 className="text-center text-xl font-semibold text-gray-800">
                Jane Smith
              </h3>
              <p className="text-center text-gray-600">CTO</p>
            </div>
            <div className="rounded-lg bg-light p-6 shadow">
              <Image
                src="/team/member3.jpg"
                alt="Team Member 3"
                className="mx-auto mb-4 h-32 w-32 rounded-full"
              />
              <h3 className="text-center text-xl font-semibold text-gray-800">
                Sam Johnson
              </h3>
              <p className="text-center text-gray-600">Lead Developer</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
