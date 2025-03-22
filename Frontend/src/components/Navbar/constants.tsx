import React from 'react';
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

interface NavItem {
  path: string;
  label: string;
}

interface ProfileItem extends NavItem {
  icon: React.ReactElement;
}

export const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/career-roadmap', label: 'Career Roadmap' },
  { path: '/coding-challenges', label: 'Challenges' },
  { path: '/articles', label: 'Articles' },
  { path: '/community', label: 'Community' },
];

export const publicNavItems: NavItem[] = [
  { path: '/about-us', label: 'About Us' },
  { path: '/contact-us', label: 'Contact' },
  { path: '/auth/login', label: 'Login' },
];

export const profileItems: ProfileItem[] = [
  { path: '/profile', label: 'Profile', icon: <FiUser /> },
  { path: '/settings', label: 'Settings', icon: <FiSettings /> },
  { path: '/auth/logout', label: 'Logout', icon: <FiLogOut /> },
];
