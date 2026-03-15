'use client';

import { useForm, type Control, useFormContext } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Badge } from '@/components/ui/badge';
import { X, Plus, GripVertical, Trash2 } from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface RoadmapCategory {
  id: string;
  name: string;
}

interface MainConcept {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  title?: string;
}

interface Topic {
  id: string;
  name: string;
}

interface CreateRoadmapProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: RoadmapCategory[];
}

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must not exceed 500 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedHours: z.number().min(1, 'Estimated hours must be at least 1'),
  isPublic: z.boolean().default(false),
  version: z.string().default('1.0'),
  tags: z.array(z.string()).default([]),
  mainConcepts: z
    .array(
      z.object({
        main_concept_id: z.string(),
        order: z.number(),
        subjects: z.array(
          z.object({
            subject_id: z.string(),
            order: z.number(),
            topics: z.array(
              z.object({
                topic_id: z.string(),
                order: z.number(),
              }),
            ),
          }),
        ),
      }),
    )
    .min(1, 'At least one main concept is required'),
});

type FormData = z.infer<typeof formSchema>;

interface TagsListProps {
  tags: string[];
  onRemove: (tag: string) => void;
}

const TagsList = ({ tags, onRemove }: TagsListProps) => (
  <div className="flex flex-wrap gap-2">
    {tags.map((tag) => (
      <Badge key={tag} variant="secondary" className="gap-1 pr-1">
        {tag}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(tag)}
          className="h-4 w-4 rounded-full p-0 hover:bg-destructive/20"
        >
          <X size={10} />
        </Button>
      </Badge>
    ))}
  </div>
);

interface TopicFormProps {
  mainConceptIndex: number;
  subjectIndex: number;
  topicIndex: number;
  control: Control<FormData>;
  availableTopics: Topic[];
  onRemove: () => void;
}

const TopicForm = ({
  mainConceptIndex,
  subjectIndex,
  topicIndex,
  control,
  availableTopics,
  onRemove,
}: TopicFormProps) => (
  <div className="relative rounded-lg border bg-background p-3">
    <div className="mb-1 flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={12} className="mr-1" /> Remove
      </Button>
    </div>
    <FormField
      control={control}
      name={`mainConcepts.${mainConceptIndex}.subjects.${subjectIndex}.topics.${topicIndex}.topic_id`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Topic</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {availableTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

interface SubjectFormProps {
  mainConceptIndex: number;
  subjectIndex: number;
  control: Control<FormData>;
  availableSubjects: Subject[];
  availableTopics: Topic[];
  onRemove: () => void;
}

const SubjectForm = ({
  mainConceptIndex,
  subjectIndex,
  control,
  availableSubjects,
  availableTopics,
  onRemove,
}: SubjectFormProps) => {
  const { watch, setValue } = useFormContext<FormData>();
  const topics =
    watch(`mainConcepts.${mainConceptIndex}.subjects.${subjectIndex}.topics`) ||
    [];

  const handleAddTopic = () => {
    const currentConcepts = watch('mainConcepts');
    const updatedConcepts = [...currentConcepts];
    updatedConcepts[mainConceptIndex].subjects[subjectIndex].topics = [
      ...(updatedConcepts[mainConceptIndex].subjects[subjectIndex].topics ||
        []),
      {
        topic_id: '',
        order:
          updatedConcepts[mainConceptIndex].subjects[subjectIndex].topics
            ?.length || 0,
      },
    ];
    setValue('mainConcepts', updatedConcepts);
  };

  return (
    <div className="mb-4 flex items-start gap-2">
      <div className="mt-2 cursor-move">
        <GripVertical size={16} className="text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-4">
        <FormField
          control={control}
          name={`mainConcepts.${mainConceptIndex}.subjects.${subjectIndex}.subject_id`}
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name || subject.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Topics</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTopic}
            >
              <Plus size={16} className="mr-1" /> Add Topic
            </Button>
          </div>

          {topics.map((topic, topicIndex) => (
            <TopicForm
              key={`topic-${mainConceptIndex}-${subjectIndex}-${topicIndex}`}
              mainConceptIndex={mainConceptIndex}
              subjectIndex={subjectIndex}
              topicIndex={topicIndex}
              control={control}
              availableTopics={availableTopics}
              onRemove={() => {
                const currentConcepts = watch('mainConcepts');
                const updatedConcepts = [...currentConcepts];
                updatedConcepts[mainConceptIndex].subjects[
                  subjectIndex
                ].topics.splice(topicIndex, 1);
                setValue('mainConcepts', updatedConcepts);
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={12} className="mr-1" /> Remove Subject
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MainConceptFormProps {
  mainConceptIndex: number;
  control: Control<FormData>;
  availableMainConcepts: MainConcept[];
  availableSubjects: Subject[];
  availableTopics: Topic[];
  onRemove: () => void;
}

const MainConceptForm = ({
  mainConceptIndex,
  control,
  availableMainConcepts,
  availableSubjects,
  availableTopics,
  onRemove,
}: MainConceptFormProps) => {
  const { watch, setValue } = useFormContext<FormData>();
  const subjects = watch(`mainConcepts.${mainConceptIndex}.subjects`) || [];

  const handleAddSubject = () => {
    const currentConcepts = watch('mainConcepts');
    const updatedConcepts = [...currentConcepts];
    updatedConcepts[mainConceptIndex].subjects = [
      ...(updatedConcepts[mainConceptIndex].subjects || []),
      {
        subject_id: '',
        order: updatedConcepts[mainConceptIndex].subjects?.length || 0,
        topics: [],
      },
    ];
    setValue('mainConcepts', updatedConcepts);
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={`mainConcepts.${mainConceptIndex}.main_concept_id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Main Concept</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select main concept" />
                </SelectTrigger>
                <SelectContent>
                  {availableMainConcepts.map((concept) => (
                    <SelectItem key={concept.id} value={concept.id}>
                      {concept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FormLabel>Subjects</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSubject}
          >
            <Plus size={16} className="mr-1" /> Add Subject
          </Button>
        </div>

        {subjects.map((subject, subjectIndex) => (
          <SubjectForm
            key={`subject-${mainConceptIndex}-${subjectIndex}`}
            mainConceptIndex={mainConceptIndex}
            subjectIndex={subjectIndex}
            control={control}
            availableSubjects={availableSubjects}
            availableTopics={availableTopics}
            onRemove={() => {
              const currentConcepts = watch('mainConcepts');
              const updatedConcepts = [...currentConcepts];
              updatedConcepts[mainConceptIndex].subjects.splice(
                subjectIndex,
                1,
              );
              setValue('mainConcepts', updatedConcepts);
            }}
          />
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 size={14} className="mr-1.5" /> Remove Concept
        </Button>
      </div>
    </div>
  );
};

export function CreateRoadmap({
  isOpen,
  onClose,
  onSuccess,
  categories,
}: CreateRoadmapProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainConcepts, setMainConcepts] = useState<MainConcept[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [createRoadmap] = useAxiosPost('/api/roadmaps');
  const [getMainConcepts] = useAxiosGet<MainConcept[]>('/api/main-concepts');
  const [getSubjects] = useAxiosGet<Subject[]>('/api/subjects');
  const [getTopics] = useAxiosGet<Topic[]>('/api/topics');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      difficulty: 'BEGINNER',
      estimatedHours: 1,
      isPublic: false,
      version: '1.0',
      tags: [],
      mainConcepts: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mainConceptsResponse, subjectsResponse, topicsResponse] =
          await Promise.all([getMainConcepts(), getSubjects(), getTopics()]);

        setMainConcepts(mainConceptsResponse.data);
        setSubjects(subjectsResponse.data);
        setTopics(topicsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(
          'Unable to load form data. Please check your internet connection and try reopening the modal.',
        );
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, getMainConcepts, getSubjects, getTopics]);

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues('tags');
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue('tags', [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue(
      'tags',
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const addMainConcept = () => {
    const currentConcepts = form.getValues('mainConcepts');
    form.setValue('mainConcepts', [
      ...currentConcepts,
      {
        main_concept_id: '',
        order: currentConcepts.length,
        subjects: [],
      },
    ]);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(form.getValues('mainConcepts'));
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    items.forEach((item, index) => {
      item.order = index;
    });

    form.setValue('mainConcepts', items);
  };

  async function onSubmit(values: FormData) {
    try {
      setIsSubmitting(true);
      await createRoadmap({ data: values });
      toast.success('Roadmap created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating roadmap:', error);
      toast.error('Failed to create roadmap');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Roadmap"
      maxWidth="2xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Complete Frontend Development Path"
                      className="bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your roadmap and what learners will achieve..."
                    className="h-32 resize-none bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Difficulty <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Estimated Hours <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 40"
                      className="bg-background"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number.parseInt(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Public Roadmap</FormLabel>
                    <FormDescription>
                      Make this roadmap visible to everyone
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormItem>
            <FormLabel>Tags</FormLabel>
            <TagsList tags={form.watch('tags')} onRemove={removeTag} />
            <div className="mt-2 flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                className="bg-background"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
          </FormItem>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>
                Main Concepts <span className="text-destructive">*</span>
              </FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMainConcept}
              >
                <Plus size={16} className="mr-1" /> Add Concept
              </Button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="main-concepts">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {form.watch('mainConcepts').map((concept, conceptIndex) => (
                      <Draggable
                        key={`concept-${concept.main_concept_id}-${conceptIndex}`}
                        draggableId={`concept-${concept.main_concept_id}-${conceptIndex}`}
                        index={conceptIndex}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="rounded-lg border bg-card p-4"
                          >
                            <MainConceptForm
                              mainConceptIndex={conceptIndex}
                              control={form.control}
                              availableMainConcepts={mainConcepts}
                              availableSubjects={subjects}
                              availableTopics={topics}
                              onRemove={() => {
                                const currentConcepts =
                                  form.getValues('mainConcepts');
                                const updatedConcepts = [...currentConcepts];
                                updatedConcepts.splice(conceptIndex, 1);
                                form.setValue('mainConcepts', updatedConcepts);
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Roadmap'}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
