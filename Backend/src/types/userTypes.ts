export interface UserProfileData {
  username: string;
  email: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learningGoals: string[];
}

export interface UserProgressData {
  topicId: string;
  isCompleted: boolean;
  timeSpent: number;
}
