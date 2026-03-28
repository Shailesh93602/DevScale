import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Award,
  Shield,
  Users,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { Battle } from '@/types/battle';

interface BattleRulesProps {
  battle: Battle;
}

const BattleRules: React.FC<BattleRulesProps> = ({ battle }) => {
  // Generate rules based on battle properties
  const rules = [
    {
      title: 'Time Limit',
      description: `Each question has a ${battle.time_per_question} second time limit. Answer before time runs out.`,
      icon: <Clock className="h-5 w-5 text-blue" />,
    },
    {
      title: 'Scoring',
      description: `Each question is worth ${battle.points_per_question} points. Faster answers receive bonus points.`,
      icon: <Award className="h-5 w-5 text-yellow" />,
    },
    {
      title: 'Participation',
      description: `Up to ${battle.max_participants} participants can join this battle.`,
      icon: <Users className="h-5 w-5 text-green" />,
    },
    {
      title: 'Fair Play',
      description:
        'Use of external resources or assistance is not allowed during the battle.',
      icon: <Shield className="h-5 w-5 text-purple" />,
    },
    {
      title: 'Answers',
      description:
        'Once submitted, answers cannot be changed. Choose carefully!',
      icon: <AlertTriangle className="h-5 w-5 text-orange" />,
    },
  ];

  // Generate dos and don'ts
  const dos = [
    'Read each question carefully before answering',
    'Submit your answers within the time limit',
    'Respect other participants in the chat',
    'Report any technical issues immediately',
    'Have fun and learn from the experience',
  ];

  const donts = [
    'Use external resources to find answers',
    'Share answers with other participants',
    'Attempt to cheat or exploit the system',
    'Use offensive language in the chat',
    'Disconnect intentionally to avoid questions',
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <span>Battle Rules & Guidelines</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6">
            {/* Main Rules */}
            <div className="space-y-4">
              <h3 className="font-medium">Main Rules</h3>
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-3">
                  <div className="mt-0.5 flex-shrink-0">{rule.icon}</div>
                  <div>
                    <h4 className="font-medium">{rule.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Dos and Don'ts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Dos */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 font-medium text-green">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Do&apos;s</span>
                </h3>
                <ul className="space-y-2">
                  {dos.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 font-medium text-red">
                  <XCircle className="h-4 w-4" />
                  <span>Don&apos;ts</span>
                </h3>
                <ul className="space-y-2">
                  {donts.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="rounded-md bg-muted p-4">
              <h3 className="mb-2 font-medium">Additional Information</h3>
              <p className="text-sm text-muted-foreground">
                This battle is of{' '}
                <strong>{battle.difficulty.toLowerCase()}</strong> difficulty
                and It contains a total of
                <strong> {battle.total_questions}</strong> questions on the
                topic of
                <strong> {battle.topic?.title ?? 'the selected topic'}</strong>.
                The battle will start at the scheduled time and all participants
                must join before the start time.
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BattleRules;
