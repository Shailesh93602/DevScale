import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { OptionSelect } from './OptionSelect';
import type { RoadmapCategoryOption } from './roadmapFormSchema';
import type { CreateRoadmapFormState } from './useCreateRoadmapForm';

const DIFFICULTY_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export function RequiredLabel({ children }: { children: ReactNode }) {
  return (
    <FormLabel>
      {children} <span className="text-destructive">*</span>
    </FormLabel>
  );
}

function TagsList({
  tags,
  onRemove,
}: {
  tags: string[];
  onRemove: (tag: string) => void;
}) {
  return (
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
}

export function TitleAndCategoryFields({
  f,
  categories,
}: {
  f: CreateRoadmapFormState;
  categories: RoadmapCategoryOption[];
}) {
  const { control } = f.form;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <RequiredLabel>Title</RequiredLabel>
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
        control={control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <RequiredLabel>Category</RequiredLabel>
            <FormControl>
              <OptionSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Select category"
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
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

export function DescriptionField({ f }: { f: CreateRoadmapFormState }) {
  return (
    <FormField
      control={f.form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <RequiredLabel>Description</RequiredLabel>
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
  );
}

export function DifficultyHoursVisibilityFields({
  f,
}: {
  f: CreateRoadmapFormState;
}) {
  const { control } = f.form;
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <FormField
        control={control}
        name="difficulty"
        render={({ field }) => (
          <FormItem>
            <RequiredLabel>Difficulty</RequiredLabel>
            <FormControl>
              <OptionSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Select difficulty"
                options={DIFFICULTY_OPTIONS}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="estimatedHours"
        render={({ field }) => (
          <FormItem>
            <RequiredLabel>Estimated Hours</RequiredLabel>
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
        control={control}
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
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

export function TagsField({ f }: { f: CreateRoadmapFormState }) {
  return (
    <FormItem>
      <FormLabel>Tags</FormLabel>
      <TagsList tags={f.form.watch('tags')} onRemove={f.removeTag} />
      <div className="mt-2 flex gap-2">
        <Input
          value={f.tagInput}
          onChange={(e) => f.setTagInput(e.target.value)}
          placeholder="Add a tag"
          className="bg-background"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              f.addTag();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={f.addTag}>
          Add
        </Button>
      </div>
    </FormItem>
  );
}
