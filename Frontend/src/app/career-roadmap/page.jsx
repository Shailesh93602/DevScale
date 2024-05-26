import Link from 'next/link';

export default function CareerRoadmap() {
  return (
    <main className="flex flex-col text-gray-900">
      <section className="bg-gray-100 py-12 md:py-20 lg:py-28 text-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Your Career Roadmap
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Get a personalized roadmap to guide you through your engineering journey, from skill development to landing your dream job.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  href="/get-roadmap"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                >
                  Get Your Roadmap
                </Link>
              </div>
            </div>
            <img
              alt="Career Roadmap"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              height="310"
              src="/career-roadmap.svg"
              width="550"
            />
          </div>
        </div>
      </section>
      <section className="bg-white py-12 md:py-20 lg:py-28 tex-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Skills to Develop
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Identify the key skills you need to master to advance in your career.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700">Programming Languages</li>
                <li className="text-gray-700">Frameworks and Libraries</li>
                <li className="text-gray-700">Soft Skills</li>
                <li className="text-gray-700">Project Management</li>
              </ul>
            </div>
            <img
              alt="Skills Development"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              height="310"
              src="/skills-development.svg"
              width="550"
            />
          </div>
        </div>
      </section>
      <section className="bg-gray-100 py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Recommended Courses
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Enroll in these courses to gain the knowledge and expertise required for your desired role.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700">Introduction to Programming</li>
                <li className="text-gray-700">Advanced Algorithms</li>
                <li className="text-gray-700">Data Structures</li>
                <li className="text-gray-700">Project Management</li>
              </ul>
            </div>
            <img
              alt="Recommended Courses"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              height="310"
              src="/recommended-courses.svg"
              width="550"
            />
          </div>
        </div>
      </section>
      <section className="bg-white py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Career Milestones
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Track your progress with these key career milestones.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700">First Internship</li>
                <li className="text-gray-700">First Full-time Job</li>
                <li className="text-gray-700">First Promotion</li>
                <li className="text-gray-700">Leadership Role</li>
              </ul>
            </div>
            <img
              alt="Career Milestones"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              height="310"
              src="/career-milestones.svg"
              width="550"
            />
          </div>
        </div>
      </section>
      <section className="bg-gray-100 py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Resources
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Access a curated list of resources to aid your career growth.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700">Books</li>
                <li className="text-gray-700">Websites</li>
                <li className="text-gray-700">Online Communities</li>
                <li className="text-gray-700">Mentorship Programs</li>
              </ul>
            </div>
            <img
              alt="Resources"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              height="310"
              src="/resources.svg"
              width="550"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
