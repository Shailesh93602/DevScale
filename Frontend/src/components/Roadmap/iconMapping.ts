import {
  TrendingUp,
  BarChart3,
  Sparkles,
  Users,
  Star,
  LucideIcon,
  Code,
  Database,
  Server,
  LineChart,
  Tablet,
  Bot,
  CloudRain,
  Network,
  Lock,
  Layout,
  PenTool,
  Gamepad2,
} from 'lucide-react';

// Function to get icon by name
export const getIconByName = (name: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    // Basic icons
    trendingUp: TrendingUp,
    barChart: BarChart3,
    sparkles: Sparkles,
    users: Users,
    star: Star,

    // Development icons
    code: Code,
    database: Database,
    server: Server,
    chart: LineChart,
    mobile: Tablet,
    ai: Bot,
    cloud: CloudRain,
    network: Network,
    security: Lock,
    design: Layout,
    ui: PenTool,
    game: Gamepad2,
  };

  // Return the requested icon or Sparkles as fallback
  return iconMap[name] || Sparkles;
};
