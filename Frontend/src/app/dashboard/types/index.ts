export interface EnrolledRoadmap {
  id: string;
  title: string;
  author: string;
  progress: number;
  lastAccessed: string;
  topics: number;
  completed: number;
}

export interface FeaturedRoadmap {
  id: string;
  title: string;
  author: string;
  enrollments: number;
  rating: number;
  topics: number;
}
