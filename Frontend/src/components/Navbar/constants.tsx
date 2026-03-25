import React from 'react';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { Swords, Trophy, Users, Calendar, BarChart, Home } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
}

interface ProfileItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface BattleZoneItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/career-roadmap', label: 'Career Roadmap' },
  { path: '/coding-challenges', label: 'Challenges' },
  { path: '/battle-zone', label: 'Battle Zone' },
  { path: '/community', label: 'Community' },
];

export const publicNavItems: NavItem[] = [
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact' },
  { path: '/auth/login', label: 'Login' },
];

export const profileItems: ProfileItem[] = [
  { path: '/profile', label: 'Profile', icon: <FiUser /> },
  { path: '/settings', label: 'Settings', icon: <FiSettings /> },
  { path: '/auth/logout', label: 'Logout', icon: <FiLogOut /> },
];

export const battleZoneItems: BattleZoneItem[] = [
  { path: '/battle-zone', label: 'Home', icon: <Home className="h-4 w-4" /> },
  {
    path: '/battle-zone/battles',
    label: 'All Battles',
    icon: <Swords className="h-4 w-4" />,
  },
  {
    path: '/battle-zone/my-battles',
    label: 'My Battles',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    path: '/battle-zone/leaderboard',
    label: 'Leaderboard',
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    path: '/battle-zone/community',
    label: 'Community',
    icon: <Users className="h-4 w-4" />,
  },
  {
    path: '/battle-zone/statistics',
    label: 'Statistics',
    icon: <BarChart className="h-4 w-4" />,
  },
];
