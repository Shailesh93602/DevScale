import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearDashboardCache,
  readDashboardCache,
  writeDashboardCache,
} from './dashboard-cache';
import type { DashboardSummary } from '@/hooks/useDashboard';

const s = { stats: { enrolledRoadmaps: 1 } } as unknown as DashboardSummary;

describe('dashboard-cache', () => {
  beforeEach(() => sessionStorage.clear());

  it('reads only the entry written for that user', () => {
    writeDashboardCache('a', s);
    expect(readDashboardCache('a')).toEqual(s);
    expect(readDashboardCache('b')).toBeNull();
    expect(readDashboardCache(undefined)).toBeNull();
  });

  it('clearDashboardCache drops every summary, keyed or legacy, and nothing else', () => {
    writeDashboardCache('a', s);
    sessionStorage.setItem('dashboard:summary:v1', '{}');
    sessionStorage.setItem('other', 'keep');
    clearDashboardCache();
    expect(sessionStorage.length).toBe(1);
    expect(sessionStorage.getItem('other')).toBe('keep');
  });
});
