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
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      color: 'text-yellow-500',
    },
    {
      title: 'Upcoming Battles',
      value: '8',
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      color: 'text-blue-500',
    },
    {
      title: 'Total Participants',
      value: '45',
      icon: <Users className="h-5 w-5 text-green-500" />,
      color: 'text-green-500',
    },
    {
      title: 'Win Rate',
      value: '75%',
      icon: <Target className="h-5 w-5 text-purple-500" />,
      color: 'text-purple-500',
    },
  ];

  // Get breadcrumb segments
  const segments = pathname.split('/').filter(Boolean);
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
                    href={`/${segments.slice(0, index + 1).join('/')}`}
                    className={cn(
                      'text-sm font-medium',
                      index === segments.length - 1
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
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
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Welcome to Battle Zone!
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Create your first battle and start competing with other
                    developers.
                  </p>
                </div>
                <Link href="/battle-zone/create">
                  <Button size="lg" className="flex items-center gap-2">
                    <Swords className="h-5 w-5" />
                    Create Your First Battle
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stats Cards */}
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
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default BattleZoneLayout;
