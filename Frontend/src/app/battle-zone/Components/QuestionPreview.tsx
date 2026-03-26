import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BattleQuestion } from '@/types/battle';
import { HelpCircle, Timer, Award, AlertCircle } from 'lucide-react';

interface QuestionPreviewProps {
  questions: BattleQuestion[];
  totalQuestions: number;
  timePerQuestion: number;
  pointsPerQuestion: number;
  isPreview?: boolean;
}

const QuestionPreview: React.FC<QuestionPreviewProps> = ({
  questions,
  totalQuestions,
  timePerQuestion,
  pointsPerQuestion,
  isPreview = true,
}) => {
  // If we have actual questions, use them; otherwise generate placeholders
  const hasQuestions = questions && questions.length > 0;
  const displayQuestions = hasQuestions
    ? questions.slice(0, isPreview ? 2 : questions.length) // Only show 2 questions in preview mode
    : Array.from({ length: isPreview ? 2 : totalQuestions }, (_, i) => ({
        id: `placeholder-${i}`,
        battle_id: '',
        question: `Sample Question ${i + 1}`,
        options: [
          'Sample Option A',
          'Sample Option B',
          'Sample Option C',
          'Sample Option D',
        ],
        points: pointsPerQuestion,
        time_limit: timePerQuestion,
        order: i + 1,
      }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span>Questions</span>
            </div>
          </CardTitle>
          <Badge variant="outline">
            {hasQuestions ? questions.length : totalQuestions} Questions
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isPreview && !hasQuestions && (
          <div className="mb-4 rounded-md bg-yellow/10 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-yellow" />
              <div>
                <p className="text-sm font-medium text-yellow">
                  Sample Questions
                </p>
                <p className="text-xs text-yellow">
                  These are example questions. Actual questions will be
                  available when the battle starts.
                </p>
              </div>
            </div>
          </div>
        )}

        <ScrollArea
          className={`${isPreview ? 'max-h-[300px]' : 'max-h-[500px]'} pr-4`}
        >
          <div className="space-y-4">
            {displayQuestions.map((question, index) => (
              <div key={question.id} className="rounded-md border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="outline">
                    Question {question.order || index + 1}
                  </Badge>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{question.time_limit}s</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Award className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{question.points} pts</span>
                    </div>
                  </div>
                </div>

                <p className="mb-3 font-medium">{question.question}</p>

                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className="flex items-center gap-2 rounded-md border p-2 text-sm"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border text-xs">
                        {String.fromCharCode(65 + optIndex)}
                      </div>
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {isPreview && totalQuestions > 2 && (
              <div className="flex items-center justify-center py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  + {totalQuestions - 2} more questions will be available during
                  the battle
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default QuestionPreview;
