'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code2 } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useChallengeCode } from './components/useChallengeCode';
import { useChallengeRunner } from './components/useChallengeRunner';
import { WorkspaceSkeleton } from './components/WorkspaceSkeleton';
import {
  ChallengeStatusBar,
  ChallengeToolbar,
} from './components/ChallengeToolbar';
import { ProblemPanel } from './components/ProblemPanel';
import { ConsolePanel } from './components/ConsolePanel';

const EDITOR_OPTIONS = {
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 10 },
  fontFamily: 'var(--font-mono)',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
} as const;

function EditorPane({
  language,
  code,
  onChange,
}: {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-10 items-center justify-between border-b border-border px-4 py-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Code2 className="h-4 w-4" />
          Solution
        </div>
      </div>
      <div className="flex-grow overflow-hidden pt-2">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          theme="vs-dark"
          value={code}
          onChange={onChange}
          options={EDITOR_OPTIONS}
        />
      </div>
    </div>
  );
}

export default function CodingChallenge({ id }: { id: string }) {
  const [language, setLanguage] = useState('javascript');
  // Below the md breakpoint the problem/editor split stacks (ED-7).
  const isNarrow = useMediaQuery('(max-width: 767px)');
  const [activeTab, setActiveTab] = useState('description');

  const { challenge, code, handleEditorChange, resetCode } = useChallengeCode(
    id,
    language,
  );
  const runner = useChallengeRunner({
    id,
    language,
    code,
    challengeTitle: challenge?.title,
    onReviewStart: () => setActiveTab('solutions'),
  });

  if (!challenge) {
    return <WorkspaceSkeleton />;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col bg-background text-foreground">
      <ChallengeToolbar
        difficulty={challenge.difficulty}
        language={language}
        onLanguageChange={setLanguage}
        onReset={resetCode}
        runner={runner}
      />

      <ResizablePanelGroup
        direction={isNarrow ? 'vertical' : 'horizontal'}
        className="flex-grow overflow-hidden"
      >
        {/* Left Side (top on mobile): Problem Description */}
        <ResizablePanel defaultSize={isNarrow ? 45 : 40} minSize={25}>
          <ProblemPanel
            challenge={challenge}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isReviewing={runner.isReviewing}
            review={runner.review}
          />
        </ResizablePanel>

        <ResizableHandle
          className={cn(
            'bg-background transition-colors hover:bg-primary/20',
            isNarrow ? 'h-1.5 w-full' : 'w-1.5',
          )}
        />

        {/* Right Side: Editor & Console */}
        <ResizablePanel defaultSize={isNarrow ? 55 : 60}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={20}>
              <EditorPane
                language={language}
                code={code}
                onChange={handleEditorChange}
              />
            </ResizablePanel>

            <ResizableHandle className="h-1.5 bg-background transition-colors hover:bg-primary/20" />

            <ResizablePanel
              defaultSize={30}
              minSize={10}
              className={cn(!runner.consoleExpanded && 'max-h-12')}
            >
              <ConsolePanel runner={runner} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <ChallengeStatusBar language={language} />
    </div>
  );
}
