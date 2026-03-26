import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tech Pioneer',
  description: 'Explore cutting-edge technology courses and resources.',
};

const TechPioneer = () => (
  <div>
    <h1>Tech Pioneer</h1>
    <ul>
      <li>
        <Link href="/tech-pioneer/coding-courses">Coding Courses</Link>
      </li>
      <li>
        <Link href="/tech-pioneer/project-development">
          Project Development
        </Link>
      </li>
      <li>
        <Link href="/tech-pioneer/ai-ml-courses">AI & ML Courses</Link>
      </li>
      <li>
        <Link href="/tech-pioneer/virtual-internship">Virtual Internship</Link>
      </li>
    </ul>
  </div>
);

export default TechPioneer;
