export const BRANDING = {
  name: 'EduScale',
  description:
    'The all-in-one platform for engineering students to learn, grow, and succeed.',
  developer: 'Shailesh Chaudhari',
  // The maker's real address. This was `contact@eduscale.com`, a mailbox that
  // does not exist on a domain this project does not own.
  contactEmail: 'shailesh93602@gmail.com',
  website: 'https://shaileshchaudhari.vercel.app',
  repository: 'https://github.com/Shailesh93602/DevScale',
  // Only links that resolve to something that is actually his. The footer used
  // to show Twitter, LinkedIn, GitHub and Discord handles named "eduscale" —
  // none of which belong to this project, so every icon led a visitor to a
  // stranger's page or a 404.
  socialLinks: [
    {
      name: 'Source on GitHub',
      href: 'https://github.com/Shailesh93602/DevScale',
      icon: 'FaGithub',
    },
    {
      name: 'Portfolio of Shailesh Chaudhari',
      href: 'https://shaileshchaudhari.vercel.app',
      icon: 'FaGlobe',
    },
  ],
  // What the platform offers — honest, capability-based highlights shown on the
  // landing page in place of fabricated user testimonials (EduScale is new, so
  // we don't claim users/quotes we don't have).
  communityHighlights: [
    {
      title: 'Real-time Battle Zone',
      description:
        'Go head-to-head in live coding battles with shared problems and a synced timer — practice under real pressure.',
      icon: 'FaBolt',
    },
    {
      title: 'Adaptive roadmaps',
      description:
        'Follow structured, company-aligned roadmaps and track your progress through each milestone.',
      icon: 'FaRoad',
    },
    {
      title: 'Sandboxed code runner',
      description:
        'Write and run code against test cases in a sandboxed environment, with instant feedback on every attempt.',
      icon: 'FaLaptopCode',
    },
  ],
};
