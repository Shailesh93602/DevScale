'use client';

import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Play,
  ChevronRight,
  Settings,
  RotateCcw,
  Maximize2,
  Terminal,
  Code2,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { logger } from '@/lib/logger';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

function ChallengeSkeleton() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col bg-background p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-4">
          <Skeleton className="h-9 w-[80px]" />
          <Skeleton className="h-9 w-[140px]" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>
      <div className="flex flex-grow gap-4">
        <div className="flex w-1/3 flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="w-full flex-grow" />
        </div>
        <div className="flex flex-grow flex-col gap-4">
          <Skeleton className="h-2/3 w-full" />
          <Skeleton className="h-1/3 w-full" />
        </div>
      </div>
    </div>
  );
}

interface IChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  inputFormat: string;
  outputFormat: string;
  exampleInput: string;
  exampleOutput: string;
  constraints: string;
  hints: string[];
  editorial: string;
  boilerplates: Record<string, string>;
  companyTags: string[];
  tags: string[];
}

const DEFAULT_BOILERPLATE = {
  javascript: `// JavaScript boilerplate
function main() {
    console.log('Hello, World!');
}
main();`,
  python: `# Python boilerplate
if __name__ == "__main__":
    print("Hello, World!")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  go: `package main
import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
};

interface ITestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: 'Accepted' | 'Wrong Answer' | 'Error';
  executionTime: number;
  memoryUsed: number;
}

export default function CodingChallenge({ id }: { id: string }) {
  const [challenge, setChallenge] = useState<IChallenge>();
  const [language, setLanguage] = useState('javascript');
  const [userCode, setUserCode] =
    useState<Record<string, string>>(DEFAULT_BOILERPLATE);
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<ITestResult[]>([]);
  const [activeTestTab, setActiveTestTab] = useState<string>('0');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [consoleExpanded, setConsoleExpanded] = useState(true);

  const [runCode] = useAxiosPost<ITestResult[]>('/run-code');
  const [getChallenge] = useAxiosGet<IChallenge>(`/challenges/${id}`);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);
    setConsoleExpanded(true);

    try {
      const response = await runCode({
        language,
        code: userCode[language],
        challengeId: id,
        challengeTitle: challenge?.title,
      });

      if (response.error || !response.success) {
        const errorMsg = response.message || 'Failed to execute code';
        setOutput(`Error: ${errorMsg}`);
        toast.error(errorMsg);
      } else {
        const results = response.data;
        if (Array.isArray(results) && results.length > 0) {
          setTestResults(results);
          setActiveTestTab('0');

          const allPassed = results.every((r) => r.status === 'Accepted');
          if (allPassed) {
            toast.success('Accepted', { position: 'bottom-right' });
          } else {
            toast.error('Wrong Answer', { position: 'bottom-right' });
          }
        } else {
          setOutput('Execution successful (no output)');
          toast.success('Code executed successfully');
        }
      }
    } catch (error) {
      logger.error('Error running code:', error);
      const errorMsg = (error as { message: string }).message;
      setOutput(`Error: ${errorMsg}`);
      toast.error(`Execution failed: ${errorMsg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const [saveDraft] = useAxiosPost('/run-code/draft');
  const [getCloudDraft] = useAxiosGet<{ data: { code: string } }>(
    `/run-code/draft/${id}`,
  );

  const fetchChallenge = async () => {
    try {
      const response = await getChallenge();
      const data = response.data;
      if (data) {
        setChallenge(data);

        // Priority 1: LocalStorage (unsaved changes)
        const savedProgress = localStorage.getItem(`challenge_progress_${id}`);
        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress);
            setUserCode((prev) => ({ ...prev, ...parsed }));
            console.log('[DEBUG] Restored code from LocalStorage');
          } catch (e) {
            console.error('Failed to parse saved progress', e);
          }
        } else {
          // Priority 2: Cloud Draft
          try {
            const cloudResp = await getCloudDraft({ params: { language } });
            if (cloudResp.data?.data?.code) {
              setUserCode((prev) => ({
                ...prev,
                [language]: cloudResp.data.data.code,
              }));
              console.log('[DEBUG] Restored code from Cloud');
            } else if (data.boilerplates) {
              // Priority 3: Standard boilerplates
              setUserCode((prev) => ({
                ...prev,
                ...data.boilerplates,
              }));
            }
          } catch (e) {
            if (data.boilerplates) {
              setUserCode((prev) => ({
                ...prev,
                ...data.boilerplates,
              }));
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error fetching challenge:', error);
    }
  };

  // Auto-save to LocalStorage (Immediate)
  useEffect(() => {
    if (userCode && Object.keys(userCode).length > 0) {
      localStorage.setItem(
        `challenge_progress_${id}`,
        JSON.stringify(userCode),
      );
    }
  }, [userCode, id]);

  // Cloud Sync (Debounced 2s)
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (userCode[language]) {
        try {
          await saveDraft({
            challengeId: id,
            code: userCode[language],
            language: language,
          });
          console.log('[DEBUG] Draft synced to cloud');
        } catch (e) {
          // Silently fail, local storage is still there
        }
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [userCode[language], id, language]);

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  // Load cloud draft on language switch if not in userCode
  useEffect(() => {
    const loadDraft = async () => {
      if (
        id &&
        language &&
        (!userCode[language] || userCode[language].length < 10)
      ) {
        // Simple heuristic for "empty"
        try {
          const cloudResp = await getCloudDraft({ params: { language } });
          if (cloudResp.data?.data?.code) {
            setUserCode((prev) => ({
              ...prev,
              [language]: cloudResp.data.data.code,
            }));
          }
        } catch (e) {
          // Ignore
        }
      }
    };
    loadDraft();
  }, [language, id]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setUserCode((prev) => ({ ...prev, [language]: value }));
    }
  };

  const resetCode = () => {
    setUserCode((prev) => ({
      ...prev,
      [language]:
        DEFAULT_BOILERPLATE[language as keyof typeof DEFAULT_BOILERPLATE],
    }));
  };

  if (!challenge) {
    return <ChallengeSkeleton />;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col bg-background text-foreground">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            {challenge.difficulty}
          </Badge>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-9 w-[140px] border-none bg-accent/50 hover:bg-accent">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="go">Go</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetCode}
              title="Reset Code"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="h-9 gap-2 px-4 font-semibold"
            onClick={handleRunCode}
            disabled={isRunning}
          >
            <Play className={cn('h-4 w-4', isRunning && 'animate-pulse')} />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          <Button
            variant="default"
            className="hover:bg-primary/90 h-9 gap-2 bg-primary px-6 font-semibold text-white"
            disabled={isRunning}
          >
            <CheckCircle2 className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-grow overflow-hidden"
      >
        {/* Left Side: Problem Description */}
        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="flex h-full flex-col bg-card">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex h-full flex-col"
            >
              <TabsList className="h-10 w-full justify-start rounded-none border-b border-border bg-card p-0 px-2">
                <TabsTrigger
                  value="description"
                  className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="editorial"
                  className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Code2 className="mr-2 h-4 w-4" />
                  Editorial
                </TabsTrigger>
                <TabsTrigger
                  value="hints"
                  className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Hints
                </TabsTrigger>
                <TabsTrigger
                  value="solutions"
                  className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <Code2 className="mr-2 h-4 w-4" />
                  Submissions
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="description"
                className="m-0 flex-grow overflow-hidden p-0"
              >
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                    <div>
                      <h1 className="mb-2 text-2xl font-bold tracking-tight">
                        {challenge.title}
                      </h1>
                      <div className="flex items-center gap-2">
                        {challenge.difficulty?.toUpperCase() === 'EASY' && (
                          <span className="bg-green-500/10 text-green-500 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            Easy
                          </span>
                        )}
                        {challenge.difficulty?.toUpperCase() === 'MEDIUM' && (
                          <span className="bg-yellow-500/10 text-yellow-500 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            Medium
                          </span>
                        )}
                        {challenge.difficulty?.toUpperCase() === 'HARD' && (
                          <span className="bg-red-500/10 text-red-500 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            Hard
                          </span>
                        )}
                      </div>
                    </div>

                    {/* eslint-disable-next-line no-restricted-syntax */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="text-sm leading-relaxed text-muted-foreground">
                        <ReactMarkdown>
                          {challenge.description.replace(/^#\s+.+[\r\n]+/, '')}
                        </ReactMarkdown>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <section>
                        <h3 className="mb-2 text-sm font-semibold">
                          Input Format
                        </h3>
                        <div className="rounded-md bg-accent/30 p-3 font-mono text-xs">
                          <ReactMarkdown>{challenge.inputFormat}</ReactMarkdown>
                        </div>
                      </section>
                      <section>
                        <h3 className="mb-2 text-sm font-semibold">
                          Output Format
                        </h3>
                        <div className="rounded-md bg-accent/30 p-3 font-mono text-xs">
                          <ReactMarkdown>
                            {challenge.outputFormat}
                          </ReactMarkdown>
                        </div>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section>
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                          <AlertCircle className="h-4 w-4 text-primary" />
                          Example 1
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Input
                            </p>
                            <pre className="rounded-md bg-accent/50 p-3 font-mono text-xs">
                              {challenge.exampleInput}
                            </pre>
                          </div>
                          <div>
                            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Output
                            </p>
                            <pre className="rounded-md bg-accent/50 p-3 font-mono text-xs">
                              {challenge.exampleOutput}
                            </pre>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="editorial"
                className="m-0 flex-grow overflow-hidden p-0"
              >
                <ScrollArea className="h-full p-6">
                  {challenge.editorial ? (
                    <>
                      {/* eslint-disable-next-line no-restricted-syntax */}
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="text-sm leading-relaxed text-muted-foreground">
                          <ReactMarkdown>{challenge.editorial}</ReactMarkdown>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                      <FileText className="mb-2 h-8 w-8 opacity-20" />
                      <p>Editorial is not available for this challenge yet.</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="hints"
                className="m-0 flex-grow overflow-hidden p-0"
              >
                <ScrollArea className="h-full p-6">
                  <div className="space-y-4">
                    {challenge.hints && challenge.hints.length > 0 ? (
                      challenge.hints.map((hint, idx) => (
                        <div
                          key={`hint-${idx}`}
                          className="rounded-lg border border-border bg-accent/20 p-4"
                        >
                          <h4 className="mb-1 text-xs font-semibold uppercase text-primary">
                            Hint {idx + 1}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {hint}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                        <Settings className="mb-2 h-8 w-8 opacity-20" />
                        <p>No hints available for this challenge.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="solutions"
                className="m-0 flex-grow overflow-hidden p-0"
              >
                <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                  <Code2 className="mb-2 h-8 w-8 opacity-20" />
                  <p>Your previous submissions will appear here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle className="hover:bg-primary/20 w-1.5 bg-background transition-colors" />

        {/* Right Side: Editor & Console */}
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            {/* Editor */}
            <ResizablePanel defaultSize={70} minSize={20}>
              <div className="flex h-full flex-col bg-card">
                <div className="flex h-10 items-center justify-between border-b border-border px-4 py-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Code2 className="h-4 w-4" />
                    Solution
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-grow overflow-hidden pt-2">
                  <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    theme="vs-dark"
                    value={userCode[language]}
                    onChange={handleEditorChange}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 10 },
                      fontFamily: 'var(--font-mono)',
                      cursorSmoothCaretAnimation: 'on',
                      smoothScrolling: true,
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle className="hover:bg-primary/20 h-1.5 bg-background transition-colors" />

            {/* Console Output */}
            <ResizablePanel
              defaultSize={30}
              minSize={10}
              className={cn(!consoleExpanded && 'max-h-12')}
            >
              <div className="flex h-full flex-col bg-card">
                <button
                  className="focus:ring-primary/50 flex h-12 w-full cursor-pointer items-center justify-between border-b border-border px-4 transition-colors hover:bg-accent/30 focus:outline-none focus:ring-1"
                  onClick={() => setConsoleExpanded(!consoleExpanded)}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Terminal className="h-4 w-4" />
                    Console
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
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
                    {testResults.length > 0 ? (
                      <Tabs
                        value={activeTestTab}
                        onValueChange={setActiveTestTab}
                        className="flex h-full flex-col"
                      >
                        <div className="flex items-center gap-2 border-b border-border bg-accent/5 px-4 py-1.5">
                          <TabsList className="h-7 gap-1 bg-transparent">
                            {testResults.map((res, i) => (
                              <TabsTrigger
                                key={`tab-${i}-${res.status}`}
                                value={String(i)}
                                className={cn(
                                  'h-6 rounded-md px-3 text-[11px] data-[state=active]:bg-background data-[state=active]:shadow-sm',
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
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      'text-lg font-bold',
                                      res.status === 'Accepted'
                                        ? 'text-green-500'
                                        : 'text-red-500',
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
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                      Input
                                    </p>
                                    <pre className="overflow-x-auto rounded bg-accent/30 p-2.5 text-xs text-foreground">
                                      {res.input}
                                    </pre>
                                  </div>

                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Expected
                                      </p>
                                      <pre className="overflow-x-auto rounded bg-accent/30 p-2.5 text-xs text-foreground">
                                        {res.expectedOutput}
                                      </pre>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Actual
                                      </p>
                                      <pre
                                        className={cn(
                                          'overflow-x-auto rounded border p-2.5 text-xs',
                                          res.status === 'Accepted'
                                            ? 'border-green-500/20 bg-green-500/5 text-green-500'
                                            : 'border-red-500/20 bg-red-500/5 text-red-500',
                                        )}
                                      >
                                        {res.actualOutput}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                            ))}
                          </div>
                        </ScrollArea>
                      </Tabs>
                    ) : (
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
                    )}
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Bottom Status Bar */}
      <div className="flex h-8 items-center justify-between border-t border-border bg-card px-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="bg-green-500 h-2 w-2 rounded-full" />
            Connected
          </div>
          <div>Ln 1, Col 1</div>
        </div>
        <div className="flex items-center gap-4">
          <div>UTF-8</div>
          <div className="flex items-center gap-1 uppercase">{language}</div>
        </div>
      </div>
    </div>
  );
}
