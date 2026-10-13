export interface ResourceType {
  id: string;
  topic: {
    id: string;
    title: string;
    description: string;
    order: number;
    isCompleted?: boolean;
  };
}

export interface TopicQuizData {
  id: string;
  questions?: {
    id: string;
    question: string;
    options: { id: string; text: string }[];
  }[];
}
