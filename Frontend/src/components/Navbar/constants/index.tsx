import { FaRegUserCircle } from 'react-icons/fa';
import { PiSignOutFill } from 'react-icons/pi';
import { GrAchievement, GrArticle } from 'react-icons/gr';

export const publicNavItems = [
  {
    path: '/auth/login',
    label: 'Login',
  },
  {
    path: '/auth/register',
    label: 'Register',
  },
];

export const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
  },
  {
    path: '/battle-zone',
    label: 'Battle Zone',
  },
  {
    path: '/resources',
    label: 'Resources',
  },
  {
    path: '/coding-challenges',
    label: 'Coding Challenges',
  },
  {
    path: '/career-roadmap',
    label: 'Career Roadmap',
  },
  {
    path: '/placement-preparation',
    label: 'Placement Preparation',
  },
  {
    path: '/community',
    label: 'Community',
  },
];

export const profileItems = [
  {
    path: '/profile',
    label: 'Profile',
    icon: <FaRegUserCircle />,
  },
  {
    path: '/achievements',
    label: 'Achievements',
    icon: <GrAchievement />,
  },
  {
    path: '/articles',
    label: 'My Articles',
    icon: <GrArticle />,
  },
  {
    path: '/logout',
    label: 'Logout',
    icon: <PiSignOutFill />,
  },
];
