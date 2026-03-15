import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BattleFormValues } from './battleFormValidation';
import { Progress } from '@/components/ui/progress';
import { Users, Award, Timer, BarChart } from 'lucide-react';

interface BattlePreviewProps {
  formValues: BattleFormValues;
  subjectName: string;
  topicName: string;
}

const BattlePreview: React.FC<BattlePreviewProps> = ({
  formValues,
  subjectName,
  topicName,
}) => {
  const {
    title,
    description,
    difficulty,
    length,
    date,
    time,
    maxParticipants = 10,
    pointsPerQuestion = 10,
    timePerQuestion = 30,
    totalQuestions = 10,
  } = formValues;

  const startTime = new Date(`${date}T${time}`);
  const endTime = new Date(startTime);
  const duration =
    timePerQuestion && totalQuestions
      ? Math.round((timePerQuestion * totalQuestions) / 60)
      : 0;
  endTime.setMinutes(endTime.getMinutes() + duration);

  // Calculate difficulty level for progress bar
  const getDifficultyValue = () => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 33;
      case 'medium':
        return 66;
      case 'hard':
        return 100;
      default:
        return 50;
    }
  };

  // Calculate length value for progress bar
  const getLengthValue = () => {
    switch (length?.toLowerCase()) {
      case 'short':
        return 33;
      case 'medium':
        return 66;
      case 'long':
        return 100;
      default:
        return 50;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title || 'Untitled Battle'}</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="capitalize">
              {difficulty}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Description</h4>
          <p className="text-sm text-muted-foreground">
            {description || 'No description provided'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-medium">Subject & Topic</h4>
            <p className="text-sm text-muted-foreground">
              {subjectName} {topicName && `• ${topicName}`}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Schedule</h4>
            <p className="text-sm text-muted-foreground">
              Starts: {format(startTime, 'PPP p')}
              <br />
              Ends: {format(endTime, 'PPP p')}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Battle Settings</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Max Participants:</span>
              </div>
              <div>{maxParticipants}</div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Points per Question:</span>
              </div>
              <div>{pointsPerQuestion}</div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>Time per Question:</span>
              </div>
              <div>{timePerQuestion ?? 30}s</div>
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span>Total Questions:</span>
              </div>
              <div>{totalQuestions ?? 10}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Total Duration</h4>
            <p className="text-sm text-muted-foreground">
              {Math.round(duration / 60)} minutes
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Difficulty Level</h4>
              <span className="text-sm capitalize text-muted-foreground">
                {difficulty}
              </span>
            </div>
            <Progress value={getDifficultyValue()} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Battle Length</h4>
              <span className="text-sm capitalize text-muted-foreground">
                {length}
              </span>
            </div>
            <Progress value={getLengthValue()} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattlePreview;
