import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Edit,
  Eye,
  Loader2,
  Info,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Trophy,
  Timer,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sword,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAxiosGet } from '@/hooks/useAxios';
import { difficulties, lengths } from '@/constants';
import { battleFormSchema, BattleFormValues } from './battleFormValidation';
import BattlePreview from './BattlePreview';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useBattleCreation } from '@/hooks/useBattleCreation';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface ISubject {
  id: string;
  name: string;
}

interface ITopic {
  id: string;
  title: string;
}

interface EnhancedCreateBattleFormProps {
  onSuccess?: (battleId: string) => void;
  onCancel?: () => void;
}

interface BattleCreationData {
  title: string;
  description: string;
  subjectId: string;
  topicId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  length: 'short' | 'medium' | 'long';
  time: string;
  date: string;
  startTime: string;
  endTime: string;
  totalQuestions: number | null;
  category: string;
  tags: string[];
  maxParticipants: number;
}

const EnhancedCreateBattleForm: React.FC<EnhancedCreateBattleFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const { createBattle, isSubmitting } = useBattleCreation();
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [topics, setTopics] = useState<ITopic[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // API hooks
  const [getSubjects] = useAxiosGet<
    { success?: boolean; message?: string } & ISubject[]
  >('/subjects');

  const [getTopicsBySubjectId] = useAxiosGet<
    { success?: boolean; message?: string } & ITopic[]
  >('/subjects/{{subjectId}}/topics');

  // Form setup with validation
  const form = useForm<BattleFormValues>({
    resolver: yupResolver(battleFormSchema),
    defaultValues: {
      title: '',
      description: '',
      subjectId: '',
      topicId: '',
      difficulty: difficulties.MEDIUM,
      length: lengths.MEDIUM,
      date: '',
      time: '',
      maxParticipants: 10,
      pointsPerQuestion: 10,
      timePerQuestion: 30,
      totalQuestions: 10,
    },
    mode: 'onChange',
  });

  const {
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { isValid },
  } = form;
  const formValues = watch();

  // Calculate form progress
  useEffect(() => {
    const requiredFields = [
      'title',
      'description',
      'subjectId',
      'topicId',
      'date',
      'time',
    ];

    const completedFields = requiredFields.filter(
      (field) => formValues[field as keyof BattleFormValues],
    ).length;

    setFormProgress((completedFields / requiredFields.length) * 100);
  }, [formValues]);

  // Get current subject and topic names for preview
  const currentSubjectName =
    subjects.find((s) => s.id === formValues.subjectId)?.name || '';
  const currentTopicName =
    topics.find((t) => t.id === formValues.topicId)?.title || '';

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await getSubjects();
        if (response.data) {
          setSubjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subjects',
          variant: 'destructive',
        });
      }
    };

    fetchSubjects();
  }, []);

  // Fetch topics when subject changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (!formValues.subjectId) {
        setTopics([]);
        return;
      }

      try {
        const response = await getTopicsBySubjectId(
          {},
          { subjectId: formValues.subjectId },
        );

        if (response.data) {
          setTopics(response.data);
          // Reset topic selection when subject changes
          setValue('topicId', '');
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load topics',
          variant: 'destructive',
        });
        setTopics([]);
      }
    };

    fetchTopics();
  }, [formValues.subjectId]);

  // Handle form submission
  const onSubmit = async (data: BattleFormValues) => {
    try {
      const response = await createBattle({
        ...data,
        startTime: data.date ? new Date(data.date).toISOString() : '',
        endTime: data.date ? new Date(data.date).toISOString() : '',
        category: 'battle',
        tags: [],
        maxParticipants: 2, // Default to 2 participants for battles
      } as BattleCreationData);

      if (response?.id) {
        toast({
          title: 'Success',
          description: 'Battle created successfully!',
        });
        onSuccess?.(response.id);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Error creating battle:', error);
    }
  };

  // Handle step navigation
  const nextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  // Check if current step is valid
  const isStepValid = () => {
    if (activeStep === 1) {
      return !!formValues.title && !!formValues.description;
    } else if (activeStep === 2) {
      return !!formValues.subjectId && !!formValues.topicId;
    } else if (activeStep === 3) {
      return !!formValues.date && !!formValues.time;
    }
    return true;
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const stepVariants = {
    inactive: { scale: 1 },
    active: { scale: 1.1, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <motion.h2
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-lg font-semibold"
          >
            Create Battle
          </motion.h2>
          <motion.div initial={{ x: 20 }} animate={{ x: 0 }}>
            <Badge
              variant={formProgress === 100 ? 'default' : 'outline'}
              className={cn(
                'transition-all duration-300',
                formProgress === 100 && 'animate-pulse',
              )}
            >
              {formProgress === 100 ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Ready to create</span>
                </motion.span>
              ) : (
                <span>{Math.round(formProgress)}% Complete</span>
              )}
            </Badge>
          </motion.div>
        </div>
        <Progress
          value={formProgress}
          className={cn(
            'h-2 transition-all duration-300',
            formProgress === 100 && 'bg-primary/20',
          )}
        />
      </div>

      {/* Stepper */}
      <div
        className="mb-6 flex items-center justify-between"
        role="navigation"
        aria-label="Form steps"
      >
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <motion.div
              variants={stepVariants}
              initial="inactive"
              animate={activeStep === step ? 'active' : 'inactive'}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300',
                activeStep >= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (step < activeStep) setActiveStep(step);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && step < activeStep) {
                  setActiveStep(step);
                }
              }}
              aria-label={`Step ${step}`}
              aria-current={activeStep === step ? 'step' : undefined}
            >
              {step}
            </motion.div>
            {step < 3 && (
              <div
                className={cn(
                  'h-1 w-16 transition-all duration-300',
                  activeStep > step ? 'bg-primary' : 'bg-muted',
                )}
                role="presentation"
              />
            )}
          </div>
        ))}
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger
            value="edit"
            className="data-[state=active]:bg-primary/10 flex items-center gap-2 transition-all duration-300"
          >
            <Edit className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-primary/10 flex items-center gap-2 transition-all duration-300"
          >
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Basic Information */}
              {activeStep === 1 && (
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="border-primary/20 hover:border-primary/40 border-2 transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">
                            Basic Information
                          </h3>
                          <Badge variant="outline" className="ml-auto">
                            Required
                          </Badge>
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
                                    <TooltipContent>
                                      <p>
                                        Choose a catchy title that describes
                                        your battle
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter a catchy title"
                                  {...field}
                                  className="focus:ring-primary/20 transition-all duration-200 focus:ring-2"
                                />
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
                              <FormLabel className="flex items-center gap-1">
                                Description
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        Provide details about what this battle
                                        is about
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe what this battle is about"
                                  rows={4}
                                  {...field}
                                  className="focus:ring-primary/20 transition-all duration-200 focus:ring-2"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Subject and Topic */}
              {activeStep === 2 && (
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="border-primary/20 hover:border-primary/40 border-2 transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">
                            Subject and Topic
                          </h3>
                          <Badge variant="outline" className="ml-auto">
                            Required
                          </Badge>
                        </div>

                        <FormField
                          control={control}
                          name="subjectId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                Subject
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        Select the subject area for your battle
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedSubject(value);
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="focus:ring-primary/20 transition-all duration-200 focus:ring-2">
                                    <SelectValue placeholder="Select a subject" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subjects.map((subject) => (
                                    <SelectItem
                                      key={subject.id}
                                      value={subject.id}
                                    >
                                      {subject.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name="topicId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                Topic
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        Select a specific topic within the
                                        subject
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                                disabled={
                                  !selectedSubject || topics.length === 0
                                }
                              >
                                <FormControl>
                                  <SelectTrigger className="focus:ring-primary/20 transition-all duration-200 focus:ring-2">
                                    <SelectValue
                                      placeholder={
                                        !selectedSubject
                                          ? 'Select a subject first'
                                          : topics.length === 0
                                            ? 'No topics available'
                                            : 'Select a topic'
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {topics.map((topic) => (
                                    <SelectItem key={topic.id} value={topic.id}>
                                      {topic.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Schedule and Settings */}
              {activeStep === 3 && (
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="border-primary/20 hover:border-primary/40 border-2 transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">
                            Schedule and Settings
                          </h3>
                          <Badge variant="outline" className="ml-auto">
                            Required
                          </Badge>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          'w-full pl-3 text-left font-normal',
                                          !field.value &&
                                            'text-muted-foreground',
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, 'PPP')
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      selected={
                                        field.value
                                          ? new Date(field.value)
                                          : undefined
                                      }
                                      onChange={(date: Date | null) =>
                                        field.onChange(date?.toISOString())
                                      }
                                      minDate={new Date()}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name="time"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Time</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          'w-full pl-3 text-left font-normal',
                                          !field.value &&
                                            'text-muted-foreground',
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, 'p')
                                        ) : (
                                          <span>Pick a time</span>
                                        )}
                                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <div className="flex justify-between">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          field.onChange(
                                            new Date(
                                              formValues.date,
                                            ).toISOString(),
                                          )
                                        }
                                      >
                                        <Clock className="mr-2 h-4 w-4" />
                                        {format(new Date(formValues.date), 'p')}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          field.onChange(
                                            new Date(
                                              formValues.date,
                                            ).toISOString(),
                                          )
                                        }
                                      >
                                        <Clock className="mr-2 h-4 w-4" />
                                        {format(
                                          new Date(
                                            formValues.date,
                                          ).toISOString(),
                                          'p',
                                        )}
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-base">
                              Battle Settings
                            </FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setShowAdvancedOptions(!showAdvancedOptions)
                              }
                              className="text-xs"
                            >
                              {showAdvancedOptions ? 'Hide' : 'Show'} Options
                            </Button>
                          </div>

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
                                      <TooltipContent>
                                        <p>
                                          Set the difficulty level for your
                                          battle
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </FormLabel>
                                <div className="grid grid-cols-3 gap-2">
                                  {Object.values(difficulties).map(
                                    (difficulty) => (
                                      <Button
                                        key={difficulty}
                                        type="button"
                                        variant={
                                          field.value === difficulty
                                            ? 'default'
                                            : 'outline'
                                        }
                                        className={`flex items-center justify-center gap-2 transition-all duration-200 ${
                                          field.value === difficulty
                                            ? 'border-2 border-primary shadow-sm'
                                            : 'hover:border-primary/50'
                                        }`}
                                        onClick={() =>
                                          field.onChange(difficulty)
                                        }
                                      >
                                        <Badge
                                          className={`${
                                            difficulty === 'easy'
                                              ? 'bg-green-100 text-green-800'
                                              : ''
                                          } ${difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''} ${difficulty === 'hard' ? 'bg-red-100 text-red-800' : ''} transition-colors duration-200`}
                                        >
                                          {difficulty.toUpperCase()}
                                        </Badge>
                                      </Button>
                                    ),
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name="length"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  Length
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Set the length of your battle</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </FormLabel>
                                <div className="grid grid-cols-3 gap-2">
                                  {Object.values(lengths).map((length) => (
                                    <Button
                                      key={length}
                                      type="button"
                                      variant={
                                        field.value === length
                                          ? 'default'
                                          : 'outline'
                                      }
                                      className={`flex items-center justify-center gap-2 transition-all duration-200 ${
                                        field.value === length
                                          ? 'border-2 border-primary shadow-sm'
                                          : 'hover:border-primary/50'
                                      }`}
                                      onClick={() => field.onChange(length)}
                                    >
                                      {length.charAt(0).toUpperCase() +
                                        length.slice(1)}
                                    </Button>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {showAdvancedOptions && (
                            <div className="space-y-4 rounded-lg border p-4">
                              <FormField
                                control={control}
                                name="maxParticipants"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                      Max Participants
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              Set the maximum number of
                                              participants
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          type="number"
                                          min={2}
                                          max={50}
                                          {...field}
                                          value={field.value ?? ''}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseInt(e.target.value) || 2,
                                            )
                                          }
                                          className="focus:ring-primary/20 pl-10 transition-all duration-200 focus:ring-2"
                                        />
                                      </div>
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
                                      Points per Question
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              Set the points awarded for each
                                              correct answer
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Trophy className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          type="number"
                                          min={1}
                                          max={100}
                                          {...field}
                                          value={field.value ?? ''}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseInt(e.target.value) || 1,
                                            )
                                          }
                                          className="focus:ring-primary/20 pl-10 transition-all duration-200 focus:ring-2"
                                        />
                                      </div>
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
                                      Time per Question (seconds)
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              Set the time limit for each
                                              question
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Timer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          type="number"
                                          min={10}
                                          max={300}
                                          {...field}
                                          value={field.value ?? ''}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseInt(e.target.value) || 10,
                                            )
                                          }
                                          className="focus:ring-primary/20 pl-10 transition-all duration-200 focus:ring-2"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={control}
                                name="totalQuestions"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                      Total Questions
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              Set the total number of questions
                                              in the battle
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Info className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          type="number"
                                          min={5}
                                          max={50}
                                          {...field}
                                          value={field.value ?? ''}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseInt(e.target.value) || 5,
                                            )
                                          }
                                          className="focus:ring-primary/20 pl-10 transition-all duration-200 focus:ring-2"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Navigation buttons */}
              <motion.div
                className="flex items-center justify-between space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex space-x-2">
                  {activeStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="group transition-all duration-300 hover:bg-muted"
                    >
                      <motion.span
                        initial={{ x: 10 }}
                        animate={{ x: 0 }}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Previous
                      </motion.span>
                    </Button>
                  )}
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      disabled={isSubmitting}
                      className="transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  {activeStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="group min-w-[120px] transition-all duration-300"
                    >
                      <motion.span
                        initial={{ x: -10 }}
                        animate={{ x: 0 }}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </motion.span>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className={cn(
                        'min-w-[120px] transition-all duration-300',
                        isValid && !isSubmitting && 'animate-pulse',
                      )}
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating...</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <span>Create Battle</span>
                          <Sword className="h-4 w-4" />
                        </motion.span>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-6">
            {!formValues.title ||
            !formValues.description ||
            !formValues.topicId ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="space-y-2">
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Preview not available</h3>
                  <p className="text-sm text-muted-foreground">
                    Please fill in at least the title, description, and select a
                    topic to see the preview.
                  </p>
                  <div className="mt-4 space-y-2 text-left">
                    {!formValues.title && (
                      <div className="text-red-500 flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Title is required</span>
                      </div>
                    )}
                    {!formValues.description && (
                      <div className="text-red-500 flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Description is required</span>
                      </div>
                    )}
                    {!formValues.topicId && (
                      <div className="text-red-500 flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Topic selection is required</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <BattlePreview
                formValues={formValues}
                subjectName={currentSubjectName}
                topicName={currentTopicName}
              />
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const tabsList = document.querySelector('[role="tablist"]');
                  if (tabsList) {
                    const editTab = tabsList.querySelector(
                      '[value="edit"]',
                    ) as HTMLElement;
                    if (editTab) editTab.click();
                  }
                }}
                className="min-w-[120px] transition-all duration-200 hover:bg-muted"
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={!isValid || isSubmitting}
                className="min-w-[120px] transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Battle'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EnhancedCreateBattleForm;
