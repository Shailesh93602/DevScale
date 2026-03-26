export interface DashboardMetrics {
  userStats: UserStats;
  platformMetrics: PlatformMetrics;
  activityMetrics: ActivityMetrics;
  systemHealth: SystemHealth;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByRole: Record<
    'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown',
    number
  >;
  completionRates: Record<string, number>;
}

export interface PlatformMetrics {
  totalRoadmaps: number;
  totalChallenges: number;
  totalArticles: number;
  totalQuizzes: number;
  engagementRate: number;
}

export interface ActivityMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  peakUsageTimes: string[];
}

export interface SystemHealth {
  databaseStatus: string;
  cacheStatus: string;
  averageResponseTime: number;
  errorRate: number;
}

export interface ResourceAllocation {
  resourceType: 'cpu' | 'memory' | 'storage' | 'network';
  resourceId: string;
  allocation: {
    amount: number;
    unit: string;
    priority: 'low' | 'medium' | 'high';
  };
}

export interface ReportConfig {
  metrics: Array<
    'userGrowth' | 'contentEngagement' | 'challengeCompletion' | 'resourceUsage'
  >;
  filters?: Record<string, unknown>;
  groupBy?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  format?: 'json' | 'csv';
}

export interface MetricData {
  type?: string;
  difficulty?: string;
  status?: string;
  date?: Date;
  count: number;
  downloads?: number;
  rating?: number;
}

export interface UserGrowthMetric {
  created_at: Date;
  _count: number;
}

export interface ContentEngagementMetric {
  type: string;
  difficulty: string;
  _count: { _all: number };
  _avg: { downloadCount: number | null; rating: number | null };
}

export interface ChallengeCompletionMetric {
  status: string;
  _count: number;
}

export interface ResourceUsageMetric {
  type: string;
  _count: { _all: number };
  _sum: { downloadCount: number | null };
}

export type MetricDataType =
  | UserGrowthMetric
  | ContentEngagementMetric
  | ChallengeCompletionMetric
  | ResourceUsageMetric;

export interface ReportResult {
  userGrowth?: MetricDataType[];
  contentEngagement?: MetricDataType[];
  challengeCompletion?: MetricDataType[];
  resourceUsage?: MetricDataType[];
}

export interface ContentModeration {
  contentId: string;
  action: 'approve' | 'reject';
  reason: string;
}
