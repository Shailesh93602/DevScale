export type QuestionOptionData = {
    text: string;
    isCorrect: boolean;
};

export type QuestionData = {
    question: string;
    points: number;
    options: QuestionOptionData[];
};

export type QuizData = {
    title: string;
    description: string;
    passingScore: number;
    timeLimit: number;
    questions: QuestionData[];
};

export type ArticleData = {
    title: string;
    content: string; // HTML content
};

export type TopicData = {
    name: string;
    description: string;
    order: number;
    articles: ArticleData[];
    quizzes: QuizData[];
};

export type SubjectData = {
    name: string;
    description: string;
    order: number;
    topics: TopicData[];
};

export type MainConceptData = {
    name: string;
    description: string;
    order: number;
    subjects: SubjectData[];
};

export type DetailedRoadmapData = {
    title: string;
    description: string;
    tags: string;
    mainConcepts: MainConceptData[];
};
