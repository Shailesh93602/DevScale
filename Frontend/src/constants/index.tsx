import javascript from '../../public/images/landing-page/js.webp';
import ReactImage from '../../public/images/landing-page/react-context-api.png';
import Angular from '../../public/images/landing-page/angular.jpeg';
import Python from '../../public/images/landing-page/Python-01.jpg';
import Node from '../../public/images/landing-page/node.png';
import Mongo from '../../public/images/landing-page/mongo.png';
import PhP from '../../public/images/landing-page/php-card.webp';
import java from '../../public/images/landing-page/java.webp';
import Flutter from '../../public/images/landing-page/flutter.png';
import goLang from '../../public/images/landing-page/go.jpg';
import DsA from '../../public/images/landing-page/dsa.jpeg';
import django from '../../public/images/landing-page/django.svg';
import spring_boot from '../../public/images/landing-page/spring-boot.png';
import aws from '../../public/images/landing-page/aws.jpg';
import git from '../../public/images/landing-page/git.png';
import Image from 'next/image';

export const difficulties = Object.freeze({
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
});

export const lengths = Object.freeze({
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
});

export const products = [
  {
    title: 'javascript',
    link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    thumbnail: javascript,
  },
  {
    title: 'React',
    link: 'https://react.dev/',
    thumbnail: ReactImage,
  },
  {
    title: 'Angular',
    link: 'https://v17.angular.io/start',
    thumbnail: Angular,
  },

  {
    title: 'python',
    link: 'https://www.python.org',
    thumbnail: Python,
  },
  {
    title: 'Node js',
    link: 'https://nodejs.org/en',
    thumbnail: Node,
  },
  {
    title: 'Mongo Db',
    link: 'https://www.mongodb.com/',
    thumbnail: Mongo,
  },

  {
    title: 'PHP',
    link: 'https://www.php.net/',
    thumbnail: PhP,
  },
  {
    title: 'java',
    link: 'https://www.java.com/en/',
    thumbnail: java,
  },
  {
    title: 'Flutter',
    link: 'https://flutter.dev/',
    thumbnail: Flutter,
  },
  {
    title: 'goLang',
    link: 'https://go.dev/',
    thumbnail: goLang,
  },
  {
    title: 'DsA',
    link: 'https://www.programiz.com/dsa',
    thumbnail: DsA,
  },

  {
    title: 'Django',
    link: 'https://www.djangoproject.com/',
    thumbnail: django,
  },
  {
    title: 'Spring Boot',
    link: 'https://spring.io/projects/spring-boot',
    thumbnail: spring_boot,
  },
  {
    title: 'Git',
    link: 'https://git-scm.com/',
    thumbnail: git,
  },
  {
    title: 'AWS',
    link: 'https://aws.amazon.com/',
    thumbnail: aws,
  },
];

export const content = [
  {
    title: 'Interactive Coding Tutorials',
    description:
      'Dive into our interactive coding tutorials designed for all skill levels. From beginners to advanced programmers, our platform offers hands-on learning experiences that make complex concepts easy to understand. Code in real-time, get instant feedback, and watch your skills grow with every lesson.',
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--blue-500),var(--indigo-500))] text-white">
        Interactive Coding Tutorials
      </div>
    ),
  },
  {
    title: 'Live Coding Sessions',
    description:
      "Join our expert instructors in live coding sessions. Watch real-world problems being solved, ask questions, and learn best practices in real-time. These sessions bridge the gap between theory and practical application, giving you insights that textbooks can't provide.",
    content: (
      <div className="flex h-full w-full items-center justify-center text-white">
        <Image
          src="/skills-development.svg"
          width={300}
          height={300}
          className="h-full w-full object-cover"
          alt="Live coding session demo"
        />
      </div>
    ),
  },
  {
    title: 'Project-Based Learning',
    description:
      'Apply your skills to real-world projects. Our project-based learning approach allows you to build a portfolio while you learn. From web applications to mobile apps, tackle projects that matter and showcase your abilities to potential employers.',
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--green-500),var(--teal-500))] text-white">
        Project-Based Learning
      </div>
    ),
  },
  {
    title: 'Personalized Learning Paths',
    description:
      "Everyone's learning journey is unique. Our AI-powered platform creates personalized learning paths tailored to your goals, current skill level, and learning style. Stay motivated with a curriculum that adapts to your progress and challenges you at the right pace.",
    content: (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(to_bottom_right,var(--purple-500),var(--pink-500))] text-white">
        Personalized Learning Paths
      </div>
    ),
  },
];

export interface IResource {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  Articles: { content: string }[];
}

// Navigation and footer links organized by category

// Quick Links
export const quickLinks = [
  {
    name: 'Roadmaps',
    href: '/career-roadmap',
  },
  {
    name: 'Community',
    href: '/community',
  },
  {
    name: 'Interview Prep',
    href: '/interview-prep',
  },
  {
    name: 'Battle Zone',
    href: '/battle-zone',
  },
  {
    name: 'Resources',
    href: '/resources',
  },
];

// Resource Links
export const resourceLinks = [
  {
    name: 'Blog',
    href: '/blog',
  },
  {
    name: 'Tutorials',
    href: '/tutorials',
  },
  {
    name: 'FAQ',
    href: '/faq',
  },
  {
    name: 'Support',
    href: '/support',
  },
];

// Footer Links
export const footerLinks = [
  {
    name: 'FAQ',
    href: '/faq',
  },
  {
    name: 'About Us',
    href: '/about-us',
  },
  {
    name: 'Contact Us',
    href: '/contact-us',
  },
  {
    name: 'Blogs',
    href: '/blogs',
  },
  {
    name: 'Discussion Forums',
    href: '/discussion-forums',
  },
];

// Social Media Links
export const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://x.com/shaileshwork',
    icon: 'FaTwitter',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/shaileshbhaichaudhari/',
    icon: 'FaLinkedin',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/shailesh93602',
    icon: 'FaGithub',
  },
  {
    name: 'Discord',
    href: '#',
    icon: 'FaDiscord',
  },
];

// Contact Information
export const contactInfo = [
  {
    text: 'contact@EduScales.com',
  },
  {
    text: '+91 9313026530',
  },
  {
    text: 'Ahmedabad, India',
  },
];

// Company Information
export const companyInfo = {
  name: 'EduScales',
  description:
    'The all-in-one platform for engineering students to learn, grow, and succeed.',
};

// CTA Links
export const ctaLinks = {
  getStarted: {
    name: 'Get Started Free',
    href: '/auth/register',
  },
  learnMore: {
    name: 'Learn More',
    href: '/about-us',
  },
  battleZone: {
    name: 'Will you make it to the top?',
    href: '/battle-zone',
  },
};
