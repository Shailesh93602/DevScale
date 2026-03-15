import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  Clock,
  Target,
  Zap,
  Users,
  Plus,
  Swords,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BattleZoneLayoutProps {
  children: ReactNode;
}

const BattleZoneLayout: React.FC<BattleZoneLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const quickStats = [
    {
      title: 'Active Battles',
      value: '12',
      icon: <Zap className="text-yellow-500 h-5 w-5" />,
      color: 'text-yellow-500',
    },
    {
      title: 'Upcoming Battles',
      value: '8',
      icon: <Clock className="text-blue-500 h-5 w-5" />,
      color: 'text-blue-500',
    },
    {
      title: 'Total Participants',
      value: '45',
      icon: <Users className="text-green-500 h-5 w-5" />,
      color: 'text-green-500',
    },
    {
      title: 'Win Rate',
      value: '75%',
      icon: <Target className="text-purple-500 h-5 w-5" />,
      color: 'text-purple-500',
    },
  ];

  // Get breadcrumb segments
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter((s) => s !== 'battle-zone');
  const isHomePage = pathname === '/battle-zone';

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2">
              <Link
                href="/battle-zone"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Battle Zone
              </Link>
              {segments.map((segment, index) => (
                <React.Fragment key={segment}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={`/battle-zone/${segments.slice(0, index + 1).join('/')}`}
                    className={cn(
                      'text-sm font-medium',
                      index === segments.length - 1
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {segment
                      .split('-')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                  </Link>
                </React.Fragment>
              ))}
            </div>

            {/* Create Battle Button */}
            <Link href="/battle-zone/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Battle
              </Button>
            </Link>
          </div>

          {/* Stats Bar - Only show on non-home pages */}
          {!isHomePage && (
            <div className="mt-4 hidden grid-cols-4 gap-4 lg:grid">
              {quickStats.map((stat) => (
                <div
                  key={stat.title}
                  className="flex items-center gap-2 rounded-lg bg-muted/50 p-2"
                >
                  <div className={cn('rounded-full bg-muted p-2', stat.color)}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isHomePage ? (
          <div className="space-y-8">
            {/* Welcome Section for New Users */}
            <motion.div
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              className="border-primary/20 rounded-2xl border bg-card p-10 shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary)/0.08) 100%)',
              }}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Welcome to Battle Zone! ⚡
                  </h2>
                  <p className="mt-3 text-lg text-muted-foreground">
                    Create your first battle and start competing with top-tier
                    developers seamlessly.
                  </p>
                </div>
                <Link href="/battle-zone/create" className="shrink-0">
                  <Button
                    size="lg"
                    className="shadow-primary/30 flex items-center gap-2 rounded-xl px-8 shadow-md"
                  >
                    <Swords className="h-5 w-5" />
                    Create Your First Battle
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats Cards - Temporarily removed because they were static
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickStats.map((stat) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <div
                        className={cn('rounded-full bg-muted p-2', stat.color)}
                      >
                        {stat.icon}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div> */}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default BattleZoneLayout;
