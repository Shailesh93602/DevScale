import { Router } from 'express';
import { UserRoutes } from './userRoutes.js';
import { AdminRoutes } from './adminRoutes.js';
import { AnalyticsRoutes } from './analyticsRoutes.js';
import { RoadMapRoutes } from './roadMapRoutes.js';
import { ArticleRoutes } from './articleRoutes.js';
import { ResourceRoutes } from './resourceRoutes.js';
import { ChallengeRoutes } from './challengeRoutes.js';
import { TopicRoutes } from './topicRoutes.js';
import { SubjectRoutes } from './subjectRoutes.js';
import { MainConceptRoutes } from './mainConceptRoutes.js';
import { HealthCheckRoutes } from './healthCheckRoutes.js';
import { StreakRoutes } from './streakRoutes.js';
import { DashboardRoutes } from './dashboardRoutes.js';
import { BattleRoutes } from './battleRoutes.js';
import { ChatRoutes } from './chatRoutes.js';
import { CommunityForumRoutes } from './communityForumRoutes.js';
import { CourseRoutes } from './courseRoutes.js';
import { JobRoutes } from './jobRoutes.js';
import { LeaderboardRoutes } from './leaderBoardRoutes.js';
import { PlacementRoutes } from './placementRoutes.js';
import { ProgressRoutes } from './progressRoutes.js';
import { QuizRouter } from './quizRoutes.js';
import { RBACRoutes } from './rbacRoutes.js';
import { SupportRoutes } from './supportRoutes.js';
import { CodeRoutes } from './codeRoutes.js';
import { AuthRoutes } from './authRoutes.js';
import { StatsRoutes } from './statsRoutes.js';
import { SubscriptionRoutes } from './subscriptionRoutes.js';
import { CodeReviewRoutes } from './codeReviewRoutes.js';
import { RatingRoutes } from './ratingRoutes.js';
import { RecommendationRoutes } from './recommendationRoutes.js';
import { MatchmakingRoutes } from './matchmakingRoutes.js';
import { TutorRoutes } from './tutorRoutes.js';
import { AiKeySettingsRoutes } from './aiKeySettingsRoutes.js';

export class AppRoutes {
  private readonly router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Sentry smoke test — a route that exists only to throw, so the error
    // pipeline can be confirmed end to end. Registered OUTSIDE production
    // only: in production it is an unauthenticated endpoint that reliably
    // 500s, which anyone can use to flood the error tracker (and the alerts
    // built on it) with noise that looks exactly like a real incident.
    //
    // Labelled "Health check route" previously, which is close to the
    // opposite of what it does.
    if (process.env.NODE_ENV !== 'production') {
      this.router.get('/debug-sentry', () => {
        throw new Error('Sentry smoke test — this error is intentional');
      });
    }
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
    this.router.use('/quiz', new QuizRouter().getRouter());
    this.router.use('/rbac', new RBACRoutes().getRouter());
    this.router.use('/support', new SupportRoutes().getRouter());
    this.router.use('/run-code', new CodeRoutes().getRouter());
    this.router.use('/stats', new StatsRoutes().getRouter());
    this.router.use('/billing', new SubscriptionRoutes().getRouter());
    this.router.use('/code-reviews', new CodeReviewRoutes().getRouter());
    this.router.use('/ratings', new RatingRoutes().getRouter());
    this.router.use('/recommendations', new RecommendationRoutes().getRouter());
    this.router.use('/matchmaking', new MatchmakingRoutes().getRouter());
    this.router.use('/tutor', new TutorRoutes().getRouter());
    this.router.use('/settings', new AiKeySettingsRoutes().getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
