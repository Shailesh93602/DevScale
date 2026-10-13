import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import type { DropResult } from '@hello-pangea/dnd';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import {
  ConceptOptions,
  MainConcept,
  ROADMAP_FORM_DEFAULTS,
  RoadmapFormData,
  Subject,
  Topic,
  formSchema,
} from './roadmapFormSchema';

/** Loads the concept/subject/topic catalogues whenever the modal opens. */
function useConceptOptions(isOpen: boolean): ConceptOptions {
  const [mainConcepts, setMainConcepts] = useState<MainConcept[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [getMainConcepts] = useAxiosGet<MainConcept[]>('/main-concepts');
  const [getSubjects] = useAxiosGet<Subject[]>('/subjects');
  const [getTopics] = useAxiosGet<Topic[]>('/topics');

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

  return { mainConcepts, subjects, topics };
}

interface CreateRoadmapFormInput {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/** Form state, tag and concept editing, drag-reorder and submit for the create-roadmap modal. */
export function useCreateRoadmapForm({
  isOpen,
  onClose,
  onSuccess,
}: CreateRoadmapFormInput) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [createRoadmap] = useAxiosPost('/roadmaps');
  const options = useConceptOptions(isOpen);

  const form = useForm<RoadmapFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: ROADMAP_FORM_DEFAULTS,
  });

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    const currentTags = form.getValues('tags');
    if (!currentTags.includes(tag)) {
      form.setValue('tags', [...currentTags, tag]);
    }
    setTagInput('');
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
      { main_concept_id: '', order: currentConcepts.length, subjects: [] },
    ]);
  };

  const removeMainConcept = (conceptIndex: number) => {
    const updatedConcepts = [...form.getValues('mainConcepts')];
    updatedConcepts.splice(conceptIndex, 1);
    form.setValue('mainConcepts', updatedConcepts);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(form.getValues('mainConcepts'));
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    items.forEach((item, index) => {
      item.order = index;
    });

    form.setValue('mainConcepts', items);
  };

  async function onSubmit(values: RoadmapFormData) {
    try {
      setIsSubmitting(true);
      await createRoadmap({ data: values });
      toast.success('Roadmap created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating roadmap:', error);
      toast.error('Unable to create the roadmap. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    options,
    isSubmitting,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    addMainConcept,
    removeMainConcept,
    onDragEnd,
    onSubmit,
  };
}

export type CreateRoadmapFormState = ReturnType<typeof useCreateRoadmapForm>;
