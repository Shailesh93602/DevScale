import { ChevronRight, Maximize2, Terminal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { ITestResult } from './challengeTypes';
import type { ChallengeRunner } from './useChallengeRunner';

const CAPTION_CLASS =
  'text-[10px] font-bold uppercase tracking-wider text-muted-foreground';
const PRE_CLASS =
  'overflow-x-auto rounded bg-accent/30 p-2.5 text-xs text-foreground';

function TestResultDetail({ res }: { res: ITestResult }) {
  const accepted = res.status === 'Accepted';
  return (
    <>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-lg font-bold',
            accepted ? 'text-green-500' : 'text-red-500',
          )}
        >
          {res.status}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {res.executionTime}s | {res.memoryUsed}KB
        </span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className={CAPTION_CLASS}>Input</p>
          <pre className={PRE_CLASS}>{res.input}</pre>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className={CAPTION_CLASS}>Expected</p>
            <pre className={PRE_CLASS}>{res.expectedOutput}</pre>
          </div>
          <div className="space-y-1">
            <p className={CAPTION_CLASS}>Actual</p>
            <pre
              className={cn(
                'overflow-x-auto rounded border p-2.5 text-xs',
                accepted
                  ? 'border-green-500/20 bg-green-500/5 text-green-500'
                  : 'border-red-500/20 bg-red-500/5 text-red-500',
              )}
            >
              {res.actualOutput}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}

function TestResultTabs({ runner }: { runner: ChallengeRunner }) {
  const { testResults } = runner;
  return (
    <Tabs
      value={runner.activeTestTab}
      onValueChange={runner.setActiveTestTab}
      className="flex h-full flex-col"
    >
      {/* One trigger per case; on a phone the strip scrolls sideways instead of clipping (ED-7). */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-accent/5 px-4 py-1.5 [scrollbar-width:thin]">
        <TabsList className="h-7 shrink-0 gap-1 bg-transparent">
          {testResults.map((res, i) => (
            <TabsTrigger
              key={`tab-${i}-${res.status}`}
              value={String(i)}
              className={cn(
                'h-6 shrink-0 rounded-md px-3 text-[11px] data-[state=active]:bg-background data-[state=active]:shadow-sm',
                res.status === 'Accepted'
                  ? 'text-green-500 data-[state=active]:text-green-600'
                  : 'text-red-500 data-[state=active]:text-red-600',
              )}
            >
              Case {i + 1}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4">
          {testResults.map((res, i) => (
            <TabsContent
              key={`content-${i}-${res.status}`}
              value={String(i)}
              className="m-0 space-y-4 font-mono text-sm outline-none"
            >
              <TestResultDetail res={res} />
            </TabsContent>
          ))}
        </div>
      </ScrollArea>
    </Tabs>
  );
}

function RawOutput({ output }: { output: string }) {
  return (
    <ScrollArea className="flex-grow">
      <div className="p-4 font-mono text-sm">
        {output ? (
          <pre
            className={cn(
              'whitespace-pre-wrap break-all rounded-md p-3',
              output.startsWith('Error')
                ? 'border-red-500/20 bg-red-500/10 text-red-500 border'
                : 'bg-accent/30 text-foreground',
            )}
          >
            {output}
          </pre>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
            <Terminal className="mb-2 h-8 w-8 opacity-20" />
            <p>Run your code to see the output here</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

export function ConsolePanel({ runner }: { runner: ChallengeRunner }) {
  const { consoleExpanded, setConsoleExpanded } = runner;
  return (
    <div className="flex h-full flex-col bg-card">
      <button
        type="button"
        aria-expanded={consoleExpanded}
        aria-label={consoleExpanded ? 'Collapse console' : 'Expand console'}
        className="focus:ring-primary/50 flex h-12 w-full cursor-pointer items-center justify-between border-b border-border px-4 transition-colors hover:bg-accent/30 focus:outline-none focus:ring-1"
        onClick={() => setConsoleExpanded(!consoleExpanded)}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Terminal className="h-4 w-4" />
          Console
        </div>
        <div className="flex items-center gap-2">
          {/* Decorative span, not a <Button>: a button nested in this toggle is invalid HTML. */}
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center text-muted-foreground"
          >
            <Maximize2 className="h-4 w-4" />
          </span>
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              consoleExpanded ? 'rotate-90' : '',
            )}
          />
        </div>
      </button>
      {consoleExpanded && (
        <div className="flex flex-grow flex-col overflow-hidden">
          {runner.testResults.length > 0 ? (
            <TestResultTabs runner={runner} />
          ) : (
            <RawOutput output={runner.output} />
          )}
        </div>
      )}
    </div>
  );
}
