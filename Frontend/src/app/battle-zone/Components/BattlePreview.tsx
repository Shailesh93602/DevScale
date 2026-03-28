import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Award, Timer, BookOpen } from 'lucide-react';

interface BattlePreviewFormValues {
  title: string;
  description?: string;
  difficulty: string;
  type: 'QUICK' | 'SCHEDULED' | 'PRACTICE';
  maxParticipants?: number | null;
  pointsPerQuestion?: number | null;
  timePerQuestion?: number | null;
  date?: string;
  time?: string;
  questionSource?: { label: string; count: number };
}

interface BattlePreviewProps {
  formValues: BattlePreviewFormValues;
}

const BattlePreview: React.FC<BattlePreviewProps> = ({ formValues }) => {
  const {
    title,
    description,
    difficulty,
    type,
    maxParticipants = 6,
    pointsPerQuestion = 100,
    timePerQuestion = 30,
    date,
    time,
    questionSource,
  } = formValues;

  const getDifficultyValue = () => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 33;
      case 'hard':
        return 100;
      default:
        return 66;
    }
  };

  const estimatedDuration =
    timePerQuestion && questionSource?.count
      ? Math.round((timePerQuestion * questionSource.count) / 60)
      : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title || 'Untitled Battle'}</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="capitalize">
              {difficulty?.toLowerCase()}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {type?.toLowerCase()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-medium">Description</h4>
          <p className="text-sm text-muted-foreground">
            {description || 'No description provided'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <h4 className="font-medium">Question Source</h4>
            <p className="text-sm text-muted-foreground">
              {questionSource
                ? `${questionSource.label} (${questionSource.count} questions)`
                : 'Not selected yet'}
            </p>
          </div>

          {type === 'SCHEDULED' && date && time && (
            <div className="space-y-1">
              <h4 className="font-medium">Scheduled Start</h4>
              <p className="text-sm text-muted-foreground">
                {date} at {time}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Battle Settings</h4>
            <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" /> Max Players:
              </div>
              <span>{maxParticipants}</span>
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3" /> Points/Question:
              </div>
              <span>{pointsPerQuestion}</span>
              <div className="flex items-center gap-1">
                <Timer className="h-3 w-3" /> Seconds/Question:
              </div>
              <span>{timePerQuestion}s</span>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Questions:
              </div>
              <span>{questionSource?.count ?? '—'}</span>
            </div>
          </div>

          {estimatedDuration !== null && (
            <div className="space-y-1">
              <h4 className="font-medium">Estimated Duration</h4>
              <p className="text-sm text-muted-foreground">
                {estimatedDuration} minutes
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Difficulty Level</h4>
            <span className="text-sm capitalize text-muted-foreground">
              {difficulty?.toLowerCase()}
            </span>
          </div>
          <Progress value={getDifficultyValue()} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default BattlePreview;
