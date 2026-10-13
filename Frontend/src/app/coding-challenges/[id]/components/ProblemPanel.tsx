import type { ComponentType, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, Code2, FileText, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AICodeReviewPanel } from '@/app/coding-challenges/components/AICodeReviewPanel';
import type { CodeReviewResult } from '@/hooks/useCodeReview';
import type { IChallenge } from './challengeTypes';

type IconType = ComponentType<{ className?: string }>;

const TABS: { value: string; label: string; icon: IconType }[] = [
  { value: 'description', label: 'Description', icon: FileText },
  { value: 'editorial', label: 'Editorial', icon: Code2 },
  { value: 'hints', label: 'Hints', icon: Settings },
  { value: 'solutions', label: 'Submissions', icon: Code2 },
];

const DIFFICULTY_PILLS: Record<string, { label: string; className: string }> = {
  EASY: { label: 'Easy', className: 'bg-green-500/10 text-green-500' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-500/10 text-yellow-500' },
  HARD: { label: 'Hard', className: 'bg-red-500/10 text-red-500' },
};

const TAB_CONTENT_CLASS = 'm-0 flex-grow overflow-hidden p-0';

function EmptyState({
  icon: Icon,
  children,
}: {
  icon: IconType;
  children: ReactNode;
}) {
  return (
    <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
      <Icon className="mb-2 h-8 w-8 opacity-20" />
      <p>{children}</p>
    </div>
  );
}

function Markdown({ children }: { children: string }) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- dark:prose-invert is the Typography plugin modifier the theme guard allows
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <div className="text-sm leading-relaxed text-muted-foreground">
        <ReactMarkdown>{children}</ReactMarkdown>
      </div>
    </div>
  );
}

function FormatSection({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="rounded-md bg-accent/30 p-3 font-mono text-xs">
        <ReactMarkdown>{body}</ReactMarkdown>
      </div>
    </section>
  );
}

function ExampleBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <pre className="rounded-md bg-accent/50 p-3 font-mono text-xs">
        {value}
      </pre>
    </div>
  );
}

function DescriptionTab({ challenge }: { challenge: IChallenge }) {
  const pill = DIFFICULTY_PILLS[challenge.difficulty?.toUpperCase() ?? ''];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">
          {challenge.title}
        </h1>
        <div className="flex items-center gap-2">
          {pill && (
            <span
              className={`${pill.className} rounded-full px-2.5 py-0.5 text-xs font-medium`}
            >
              {pill.label}
            </span>
          )}
        </div>
      </div>

      <Markdown>{challenge.description.replace(/^#\s+.+[\r\n]+/, '')}</Markdown>

      <div className="space-y-4">
        <FormatSection title="Input Format" body={challenge.inputFormat} />
        <FormatSection title="Output Format" body={challenge.outputFormat} />
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="h-4 w-4 text-primary" />
            Example 1
          </h3>
          <div className="space-y-3">
            <ExampleBlock label="Input" value={challenge.exampleInput} />
            <ExampleBlock label="Output" value={challenge.exampleOutput} />
          </div>
        </section>
      </div>
    </div>
  );
}

function HintsTab({ hints }: { hints: string[] }) {
  return (
    <div className="space-y-4">
      {hints && hints.length > 0 ? (
        hints.map((hint, idx) => (
          <div
            key={`hint-${idx}`}
            className="rounded-lg border border-border bg-accent/20 p-4"
          >
            <h4 className="mb-1 text-xs font-semibold uppercase text-primary">
              Hint {idx + 1}
            </h4>
            <p className="text-sm text-muted-foreground">{hint}</p>
          </div>
        ))
      ) : (
        <EmptyState icon={Settings}>
          No hints available for this challenge.
        </EmptyState>
      )}
    </div>
  );
}

function SubmissionsTab({
  isReviewing,
  review,
}: {
  isReviewing: boolean;
  review: CodeReviewResult | null;
}) {
  if (isReviewing) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
        <LoadingSpinner />
        <p>Generating AI review…</p>
      </div>
    );
  }
  if (review) return <AICodeReviewPanel review={review.review} />;
  return (
    <EmptyState icon={Code2}>
      Submit your solution to get an AI code review.
    </EmptyState>
  );
}

export function ProblemPanel({
  challenge,
  activeTab,
  onTabChange,
  isReviewing,
  review,
}: {
  challenge: IChallenge;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isReviewing: boolean;
  review: CodeReviewResult | null;
}) {
  return (
    <div className="flex h-full flex-col bg-card">
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="flex h-full flex-col"
      >
        {/* The WRAPPER scrolls sideways below ~430px, not the list: overflow-x on
            a fixed-height list clips vertically and cuts the labels off (ED-7). */}
        <div className="shrink-0 overflow-x-auto border-b border-border [scrollbar-width:thin]">
          <TabsList className="h-10 w-max min-w-full justify-start rounded-none bg-card p-0 px-2">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="h-full shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="description" className={TAB_CONTENT_CLASS}>
          <ScrollArea className="h-full p-6">
            <DescriptionTab challenge={challenge} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="editorial" className={TAB_CONTENT_CLASS}>
          <ScrollArea className="h-full p-6">
            {challenge.editorial ? (
              <Markdown>{challenge.editorial}</Markdown>
            ) : (
              <EmptyState icon={FileText}>
                Editorial is not available for this challenge yet.
              </EmptyState>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="hints" className={TAB_CONTENT_CLASS}>
          <ScrollArea className="h-full p-6">
            <HintsTab hints={challenge.hints} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="solutions" className={TAB_CONTENT_CLASS}>
          <ScrollArea className="h-full">
            <SubmissionsTab isReviewing={isReviewing} review={review} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
