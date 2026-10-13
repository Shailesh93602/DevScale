import { useFormContext, type Control } from 'react-hook-form';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { OptionSelect } from './OptionSelect';
import type { ConceptOptions, RoadmapFormData } from './roadmapFormSchema';

type FormControlType = Control<RoadmapFormData>;

interface TopicFormProps {
  mainConceptIndex: number;
  subjectIndex: number;
  topicIndex: number;
  control: FormControlType;
  options: ConceptOptions;
  onRemove: () => void;
}

function TopicForm({
  mainConceptIndex,
  subjectIndex,
  topicIndex,
  control,
  options,
  onRemove,
}: TopicFormProps) {
  return (
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
              <OptionSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Select topic"
                options={options.topics.map((t) => ({
                  value: t.id,
                  label: t.name,
                }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

interface SubjectFormProps {
  mainConceptIndex: number;
  subjectIndex: number;
  control: FormControlType;
  options: ConceptOptions;
  onRemove: () => void;
}

function SubjectForm({
  mainConceptIndex,
  subjectIndex,
  control,
  options,
  onRemove,
}: SubjectFormProps) {
  const { watch, setValue } = useFormContext<RoadmapFormData>();
  const topics =
    watch(`mainConcepts.${mainConceptIndex}.subjects.${subjectIndex}.topics`) ||
    [];

  const updateTopics = (
    change: (
      topics: RoadmapFormData['mainConcepts'][number]['subjects'][number]['topics'],
    ) => void,
  ) => {
    const updatedConcepts = [...watch('mainConcepts')];
    change(updatedConcepts[mainConceptIndex].subjects[subjectIndex].topics);
    setValue('mainConcepts', updatedConcepts);
  };

  const handleAddTopic = () => {
    const updatedConcepts = [...watch('mainConcepts')];
    const subject = updatedConcepts[mainConceptIndex].subjects[subjectIndex];
    subject.topics = [
      ...(subject.topics || []),
      { topic_id: '', order: subject.topics?.length || 0 },
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
              <OptionSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Select subject"
                options={options.subjects.map((s) => ({
                  value: s.id,
                  label: s.name || s.title || '',
                }))}
              />
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
              options={options}
              onRemove={() => updateTopics((t) => t.splice(topicIndex, 1))}
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
}

interface MainConceptFormProps {
  mainConceptIndex: number;
  control: FormControlType;
  options: ConceptOptions;
  onRemove: () => void;
}

export function MainConceptForm({
  mainConceptIndex,
  control,
  options,
  onRemove,
}: MainConceptFormProps) {
  const { watch, setValue } = useFormContext<RoadmapFormData>();
  const subjects = watch(`mainConcepts.${mainConceptIndex}.subjects`) || [];

  const handleAddSubject = () => {
    const updatedConcepts = [...watch('mainConcepts')];
    const concept = updatedConcepts[mainConceptIndex];
    concept.subjects = [
      ...(concept.subjects || []),
      { subject_id: '', order: concept.subjects?.length || 0, topics: [] },
    ];
    setValue('mainConcepts', updatedConcepts);
  };

  const handleRemoveSubject = (subjectIndex: number) => {
    const updatedConcepts = [...watch('mainConcepts')];
    updatedConcepts[mainConceptIndex].subjects.splice(subjectIndex, 1);
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
              <OptionSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Select main concept"
                options={options.mainConcepts.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
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
            options={options}
            onRemove={() => handleRemoveSubject(subjectIndex)}
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
}
