import { Router } from 'express';
import { UserRoutes } from './userRoutes';
import { AdminRoutes } from './adminRoutes';
import { AnalyticsRoutes } from './analyticsRoutes';
import { RoadMapRoutes } from './roadMapRoutes';
import { ArticleRoutes } from './articleRoutes';
import { ResourceRoutes } from './resourceRoutes';
import { ChallengeRoutes } from './challengeRoutes';
import { TopicRoutes } from './topicRoutes';
import { SubjectRoutes } from './subjectRoutes';
import { MainConceptRoutes } from './mainConceptRoutes';
import { HealthCheckRoutes } from './healthCheckRoutes';
import { StreakRoutes } from './streakRoutes';
import { DashboardRoutes } from './dashboardRoutes';
import { BattleRoutes } from './battleRoutes';
import { ChatRoutes } from './chatRoutes';
import { CommunityForumRoutes } from './communityForumRoutes';
import { CourseRoutes } from './courseRoutes';
import { JobRoutes } from './jobRoutes';
import { LeaderboardRoutes } from './leaderBoardRoutes';
import { PlacementRoutes } from './placementRoutes';
import { ProgressRoutes } from './progressRoutes';
import { QuestionRoutes } from './questionRoutes';
import { QuizRouter } from './quizRoutes';
import { RBACRoutes } from './rbacRoutes';
import { SupportRoutes } from './supportRoutes';
import { CodeRoutes } from './codeRoutes';
import { AuthRoutes } from './authRoutes';
import { StatsRoutes } from './statsRoutes';

export class AppRoutes {
  private readonly router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Health check route
    this.router.use('/health', new HealthCheckRoutes().getRouter());

    // Auth routes (logout, cache refresh)
    this.router.use('/auth', new AuthRoutes().getRouter());

    // Feature routes
    this.router.use('/users', new UserRoutes().getRouter());
    this.router.use('/admin', new AdminRoutes().getRouter());
    this.router.use('/analytics', new AnalyticsRoutes().getRouter());
    this.router.use('/roadmaps', new RoadMapRoutes().getRouter());
    this.router.use('/articles', new ArticleRoutes().getRouter());
    this.router.use('/resources', new ResourceRoutes().getRouter());
    this.router.use('/challenges', new ChallengeRoutes().getRouter());
    this.router.use('/topics', new TopicRoutes().getRouter());
    this.router.use('/subjects', new SubjectRoutes().getRouter());
    this.router.use('/main-concepts', new MainConceptRoutes().getRouter());
    this.router.use('/streak', new StreakRoutes().getRouter());
    this.router.use('/dashboard', new DashboardRoutes().getRouter());

    // Additional feature routes (newly registered)
    this.router.use('/battles', new BattleRoutes().getRouter());
    this.router.use('/chat', new ChatRoutes().getRouter());
    this.router.use('/forums', new CommunityForumRoutes().getRouter());
    this.router.use('/courses', new CourseRoutes().getRouter());
    this.router.use('/jobs', new JobRoutes().getRouter());
    this.router.use('/leaderboard', new LeaderboardRoutes().getRouter());
    this.router.use('/placement', new PlacementRoutes().getRouter());
    this.router.use('/progress', new ProgressRoutes().getRouter());
    this.router.use('/questions', new QuestionRoutes().getRouter());
    this.router.use('/quiz', new QuizRouter().getRouter());
    this.router.use('/rbac', new RBACRoutes().getRouter());
    this.router.use('/support', new SupportRoutes().getRouter());
    this.router.use('/run-code', new CodeRoutes().getRouter());
    this.router.use('/stats', new StatsRoutes().getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
