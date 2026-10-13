'use client';

import { Plus } from 'lucide-react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import { MainConceptForm } from './components/create-roadmap/ConceptTreeFields';
import {
  DescriptionField,
  DifficultyHoursVisibilityFields,
  RequiredLabel,
  TagsField,
  TitleAndCategoryFields,
} from './components/create-roadmap/RoadmapBasicsFields';
import {
  CreateRoadmapFormState,
  useCreateRoadmapForm,
} from './components/create-roadmap/useCreateRoadmapForm';
import type { RoadmapCategoryOption } from './components/create-roadmap/roadmapFormSchema';

interface CreateRoadmapProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: RoadmapCategoryOption[];
}

function MainConceptsField({ f }: { f: CreateRoadmapFormState }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <RequiredLabel>Main Concepts</RequiredLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={f.addMainConcept}
        >
          <Plus size={16} className="mr-1" /> Add Concept
        </Button>
      </div>

      <DragDropContext onDragEnd={f.onDragEnd}>
        <Droppable droppableId="main-concepts">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {f.form.watch('mainConcepts').map((concept, conceptIndex) => (
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
                        control={f.form.control}
                        options={f.options}
                        onRemove={() => f.removeMainConcept(conceptIndex)}
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
  );
}

export function CreateRoadmap({
  isOpen,
  onClose,
  onSuccess,
  categories,
}: CreateRoadmapProps) {
  const f = useCreateRoadmapForm({ isOpen, onClose, onSuccess });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Roadmap"
      maxWidth="2xl"
    >
      <Form {...f.form}>
        <form onSubmit={f.form.handleSubmit(f.onSubmit)} className="space-y-6">
          <TitleAndCategoryFields f={f} categories={categories} />
          <DescriptionField f={f} />
          <DifficultyHoursVisibilityFields f={f} />
          <TagsField f={f} />
          <MainConceptsField f={f} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={f.isSubmitting}>
              {f.isSubmitting ? 'Creating...' : 'Create Roadmap'}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
