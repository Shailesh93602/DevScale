'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Loader2,
  HelpCircle,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Trophy,
  Timer,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sword,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { difficulties } from '@/constants';
import { battleFormSchema, BattleFormValues } from './battleFormValidation';
import BattlePreview from './BattlePreview';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useBattleCreation } from '@/hooks/useBattleCreation';
import QuestionSourceSelector, {
  type QuestionSource,
} from '@/components/Battle/QuestionSourceSelector';
import QuestionPreviewList from '@/components/Battle/QuestionPreviewList';

interface EnhancedCreateBattleFormProps {
  onSuccess?: (battleId: string) => void;
  onCancel?: () => void;
}

const STEP_LABELS = ['Battle Info', 'Question Source', 'Settings', 'Preview & Launch'];

const EnhancedCreateBattleForm: React.FC<EnhancedCreateBattleFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const { createBattle, isSubmitting } = useBattleCreation();
  const [activeStep, setActiveStep] = useState(1);
  const [questionSource, setQuestionSource] = useState<QuestionSource | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const form = useForm<BattleFormValues>({
    resolver: yupResolver(battleFormSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: difficulties.MEDIUM,
      type: 'QUICK',
      maxParticipants: 6,
      pointsPerQuestion: 100,
      timePerQuestion: 30,
      date: '',
      time: '',
    },
    mode: 'onChange',
  });

  const { watch, control, formState: { errors } } = form;
  const formValues = watch();

  // Progress: title + description + questionSource + (date+time if SCHEDULED)
  const completedFields = [
    !!formValues.title,
    !!formValues.description,
    !!questionSource,
    formValues.type !== 'SCHEDULED' || (!!formValues.date && !!formValues.time),
  ].filter(Boolean).length;
  const formProgress = (completedFields / 4) * 100;

  // Step validation
  const isStepValid = () => {
    if (activeStep === 1) return !!formValues.title && !!formValues.description;
    if (activeStep === 2) return !!questionSource;
    if (activeStep === 3) {
      if (formValues.type === 'SCHEDULED') return !!formValues.date && !!formValues.time;
      return true;
    }
    return true;
  };

  const nextStep = () => { if (activeStep < 4) setActiveStep(activeStep + 1); };
  const prevStep = () => { if (activeStep > 1) setActiveStep(activeStep - 1); };

  // Final creation — called from Step 4
  const handleCreateBattle = async () => {
    if (!questionSource) {
      toast({ title: 'Error', description: 'Please select a question source first.', variant: 'destructive' });
      return;
    }

    try {
      let startTime: string | undefined;
      if (formValues.type === 'SCHEDULED' && formValues.date && formValues.time) {
        const [h, m] = formValues.time.split(':');
        const dt = new Date(formValues.date);
        dt.setHours(Number(h), Number(m), 0, 0);
        if (Number.isNaN(dt.getTime())) throw new Error('Invalid date/time for scheduled battle.');
        startTime = dt.toISOString();
      }

      const response = await createBattle({
        title: formValues.title,
        description: formValues.description ?? '',
        difficulty: formValues.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
        type: formValues.type as 'QUICK' | 'SCHEDULED' | 'PRACTICE',
        max_participants: formValues.maxParticipants ?? 6,
        points_per_question: formValues.pointsPerQuestion ?? 100,
        time_per_question: formValues.timePerQuestion ?? 30,
        total_questions: questionSource.count,
        start_time: startTime,
        question_source: {
          type: questionSource.type,
          id: questionSource.id,
          difficulty: questionSource.difficulty,
          categories: questionSource.categories,
          count: questionSource.count,
        },
      });

      if (response?.id) {
        toast({ title: 'Battle created!', description: 'Questions loaded. Head to the lobby!' });
        onSuccess?.(response.slug ?? response.id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create battle.',
        variant: 'destructive',
      });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const stepVariants = {
    inactive: { scale: 1 },
    active: { scale: 1.1, transition: { duration: 0.2 } },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <motion.h2 initial={{ x: -20 }} animate={{ x: 0 }} className="text-lg font-semibold">
            Create Battle
          </motion.h2>
          <motion.div initial={{ x: 20 }} animate={{ x: 0 }}>
            <Badge
              variant={formProgress === 100 ? 'default' : 'outline'}
              className={cn('transition-all duration-300', formProgress === 100 && 'animate-pulse')}
            >
              {formProgress === 100 ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Ready to launch
                </motion.span>
              ) : (
                <span>{Math.round(formProgress)}% Complete</span>
              )}
            </Badge>
          </motion.div>
        </div>
        <Progress value={formProgress} className="h-2 transition-all duration-300" />
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center justify-between" role="navigation" aria-label="Form steps">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <motion.div
              variants={stepVariants}
              initial="inactive"
              animate={activeStep === step ? 'active' : 'inactive'}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 cursor-pointer',
                activeStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
              onClick={() => { if (step < activeStep) setActiveStep(step); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && step < activeStep) setActiveStep(step); }}
              role="button"
              tabIndex={0}
              aria-label={`Step ${step}: ${STEP_LABELS[step - 1]}`}
              aria-current={activeStep === step ? 'step' : undefined}
            >
              {activeStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
            </motion.div>
            {step < 4 && (
              <div
                className={cn('h-1 w-10 transition-all duration-300', activeStep > step ? 'bg-primary' : 'bg-muted')}
                role="presentation"
              />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <p className="text-sm text-muted-foreground">
        Step {activeStep} of 4 — <span className="font-medium text-foreground">{STEP_LABELS[activeStep - 1]}</span>
      </p>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Form {...form}>
            <div className="space-y-8">

              {/* ── Step 1: Battle Info ─────────────────────────────────── */}
              {activeStep === 1 && (
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                  <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardContent className="space-y-6 pt-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">Battle Information</h3>
                        <Badge variant="outline" className="ml-auto">Required</Badge>
                      </div>

                      <FormField
                        control={control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Battle Title
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent><p>Choose a catchy title for your battle</p></TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter a catchy title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe what this battle is about" rows={3} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── Step 2: Question Source ─────────────────────────────── */}
              {activeStep === 2 && (
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                  <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">Question Source</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Questions are auto-selected from the quiz pool for the scope you choose. No manual entry needed.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Badge variant="outline" className="ml-auto">Required</Badge>
                      </div>

                      <QuestionSourceSelector
                        value={questionSource}
                        onChange={setQuestionSource}
                        difficulty={formValues.difficulty?.toUpperCase()}
                        defaultCount={10}
                        maxCount={20}
                      />

                      {!questionSource && (
                        <p className="flex items-center gap-2 text-xs text-amber-600">
                          <AlertCircle className="h-3 w-3" />
                          Select a roadmap, subject, or topic above to continue
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── Step 3: Battle Settings ─────────────────────────────── */}
              {activeStep === 3 && (
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                  <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardContent className="space-y-6 pt-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">Battle Settings</h3>
                      </div>

                      {/* Battle type */}
                      <FormField
                        control={control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Battle Type</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                              {(['QUICK', 'SCHEDULED', 'PRACTICE'] as const).map((t) => (
                                <Button
                                  key={t}
                                  type="button"
                                  variant={field.value === t ? 'default' : 'outline'}
                                  className="capitalize"
                                  onClick={() => field.onChange(t)}
                                >
                                  {t.charAt(0) + t.slice(1).toLowerCase()}
                                </Button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Difficulty */}
                      <FormField
                        control={control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Difficulty
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent><p>Filters questions from the pool by difficulty</p></TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                              {Object.values(difficulties).map((d) => (
                                <Button
                                  key={d}
                                  type="button"
                                  variant={field.value === d ? 'default' : 'outline'}
                                  className={cn(
                                    'transition-all duration-200',
                                    field.value === d && 'border-2 border-primary shadow-sm',
                                  )}
                                  onClick={() => field.onChange(d)}
                                >
                                  {d.charAt(0) + d.slice(1).toLowerCase()}
                                </Button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Schedule fields — only for SCHEDULED */}
                      {formValues.type === 'SCHEDULED' && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                      type="date"
                                      min={new Date().toISOString().split('T')[0]}
                                      value={field.value ?? ''}
                                      onChange={(e) => field.onChange(e.target.value)}
                                      className="pl-10"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                      type="time"
                                      step={60}
                                      value={field.value ?? ''}
                                      onChange={(e) => field.onChange(e.target.value)}
                                      className="pl-10"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Advanced options toggle */}
                      <div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                          className="text-xs"
                        >
                          {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                        </Button>
                      </div>

                      {showAdvancedOptions && (
                        <div className="space-y-4 rounded-md border bg-muted/30 p-4">
                          <FormField
                            control={control}
                            name="maxParticipants"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <Users className="h-4 w-4" /> Max Participants
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={2}
                                    max={10}
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="timePerQuestion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <Timer className="h-4 w-4" /> Seconds Per Question
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={15}
                                    max={60}
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name="pointsPerQuestion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <Trophy className="h-4 w-4" /> Points Per Question
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={10}
                                    max={1000}
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── Step 4: Preview & Launch ────────────────────────────── */}
              {activeStep === 4 && (
                <motion.div variants={cardVariants} initial="hidden" animate="visible" className="space-y-4">
                  <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">Question Preview</h3>
                        <Badge variant="outline" className="ml-auto">Auto-selected</Badge>
                      </div>
                      {questionSource ? (
                        <QuestionPreviewList
                          source={questionSource}
                          difficulty={formValues.difficulty?.toUpperCase()}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">No source selected — go back to Step 2.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Summary card */}
                  <Card className="border border-dashed">
                    <CardContent className="pt-4">
                      <div className="grid gap-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Title</span>
                          <span className="font-medium">{formValues.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium capitalize">{formValues.type?.toLowerCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Difficulty</span>
                          <span className="font-medium capitalize">{formValues.difficulty?.toLowerCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Questions</span>
                          <span className="font-medium">{questionSource?.count ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Source</span>
                          <span className="font-medium">{questionSource?.label ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Players</span>
                          <span className="font-medium">{formValues.maxParticipants ?? 6}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting || !questionSource}
                    onClick={handleCreateBattle}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating battle...
                      </>
                    ) : (
                      <>
                        <Sword className="mr-2 h-4 w-4" />
                        Create Battle & Load Questions
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* ── Navigation buttons (steps 1-3) ───────────────────────── */}
              {activeStep < 4 && (
                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={activeStep === 1 && onCancel ? onCancel : prevStep}
                    disabled={activeStep === 1 && !onCancel}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {activeStep === 1 ? 'Cancel' : 'Back'}
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {activeStep === 4 && (
                <Button type="button" variant="outline" onClick={prevStep} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Settings
                </Button>
              )}

            </div>
          </Form>
        </TabsContent>

        <TabsContent value="preview">
          <BattlePreview
            formValues={{
              title: formValues.title,
              description: formValues.description ?? '',
              difficulty: formValues.difficulty,
              type: formValues.type as 'QUICK' | 'SCHEDULED' | 'PRACTICE',
              questionSource: questionSource
                ? { label: questionSource.label, count: questionSource.count }
                : undefined,
            }}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EnhancedCreateBattleForm;
