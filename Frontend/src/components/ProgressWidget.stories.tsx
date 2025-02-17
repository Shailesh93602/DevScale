import type { Meta, StoryObj } from '@storybook/react';
import ProgressWidget from './ProgressWidget';

const meta: Meta<typeof ProgressWidget> = {
  title: 'Components/ProgressWidget',
  component: ProgressWidget,
  tags: ['autodocs'],
  argTypes: {
    initialData: {
      control: 'object',
      defaultValue: {
        chapters: 10,
        items: 100,
        completedChapters: 5,
        completedItems: 25,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressWidget>;

export const Default: Story = {
  args: {
    initialData: {
      chapters: 10,
      items: 100,
      completedChapters: 5,
      completedItems: 25,
    },
  },
};

export const HalfComplete: Story = {
  args: {
    initialData: {
      chapters: 10,
      items: 100,
      completedChapters: 5,
      completedItems: 50,
    },
  },
};
