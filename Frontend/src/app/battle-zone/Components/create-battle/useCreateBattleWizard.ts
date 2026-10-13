import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { difficulties } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { useBattleCreation } from '@/hooks/useBattleCreation';
import type { QuestionSource } from '@/components/Battle/QuestionSourceSelector';
import { battleFormSchema, BattleFormValues } from '../battleFormValidation';

export const STEP_LABELS = [
  'Battle Info',
  'Question Source',
  'Settings',
  'Preview & Launch',
];

export const LAST_STEP = 4;

type BattleType = 'QUICK' | 'SCHEDULED' | 'PRACTICE';

function scheduledStartTime(values: BattleFormValues): string | undefined {
  if (values.type !== 'SCHEDULED' || !values.date || !values.time) {
    return undefined;
  }
  const [h, m] = values.time.split(':');
  const dt = new Date(values.date);
  dt.setHours(Number(h), Number(m), 0, 0);
  if (Number.isNaN(dt.getTime()))
    throw new Error('Invalid date/time for scheduled battle.');
  return dt.toISOString();
}

function toCreatePayload(values: BattleFormValues, source: QuestionSource) {
  return {
    title: values.title,
    description: values.description ?? '',
    difficulty: values.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
    type: values.type as BattleType,
    max_participants: values.maxParticipants ?? 6,
    points_per_question: values.pointsPerQuestion ?? 100,
    time_per_question: values.timePerQuestion ?? 30,
    total_questions: source.count,
    start_time: scheduledStartTime(values),
    question_source: {
      type: source.type,
      id: source.id,
      difficulty: source.difficulty,
      categories: source.categories,
      count: source.count,
    },
  };
}

/** Form state, step navigation and launch for the create-battle wizard. */
export function useCreateBattleWizard(onSuccess?: (battleId: string) => void) {
  const { toast } = useToast();
  const { createBattle, isSubmitting } = useBattleCreation();
  const [activeStep, setActiveStep] = useState(1);
  const [questionSource, setQuestionSource] = useState<QuestionSource | null>(
    null,
  );
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

  // useWatch, not form.watch(): watch() makes React Compiler skip this hook
  // (react-hooks/incompatible-library). Every field has a default, so the
  // watched snapshot is always complete.
  const formValues = useWatch({ control: form.control }) as BattleFormValues;
  const scheduleComplete =
    formValues.type !== 'SCHEDULED' || (!!formValues.date && !!formValues.time);

  // Description is optional, so it doesn't gate progress.
  const completedFields = [
    !!formValues.title,
    !!questionSource,
    scheduleComplete,
  ].filter(Boolean).length;
  const formProgress = (completedFields / 3) * 100;

  const isStepValid = () => {
    if (activeStep === 1) return !!formValues.title;
    if (activeStep === 2) return !!questionSource;
    if (activeStep === 3) return scheduleComplete;
    return true;
  };

  const nextStep = () => {
    if (activeStep < LAST_STEP) setActiveStep(activeStep + 1);
  };
  const prevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const handleCreateBattle = async () => {
    if (!questionSource) {
      toast({
        title: 'Error',
        description: 'Please select a question source first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await createBattle(
        toCreatePayload(formValues, questionSource),
      );
      if (response?.id) {
        toast({
          title: 'Battle created!',
          description: 'Questions loaded. Head to the lobby!',
        });
        onSuccess?.(response.slug ?? response.id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create battle.',
        variant: 'destructive',
      });
    }
  };

  return {
    form,
    formValues,
    formProgress,
    activeStep,
    setActiveStep,
    questionSource,
    setQuestionSource,
    showAdvancedOptions,
    setShowAdvancedOptions,
    isSubmitting,
    isStepValid,
    nextStep,
    prevStep,
    handleCreateBattle,
  };
}

export type CreateBattleWizard = ReturnType<typeof useCreateBattleWizard>;
