/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `AccessLog` table. All the data in the column will be lost.
  - You are about to drop the column `statusCode` on the `AccessLog` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `AccessLog` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AccessLog` table. All the data in the column will be lost.
  - You are about to drop the column `earnedAt` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `deviceType` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `AdminAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `AdminAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `AdminAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `AdminAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `generatedAt` on the `AdminDashboard` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsed` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `contentId` on the `ApprovalHistory` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ApprovalHistory` table. All the data in the column will be lost.
  - You are about to drop the column `reviewerId` on the `ApprovalHistory` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `moderationNotes` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `contentId` on the `AutomatedModeration` table. All the data in the column will be lost.
  - You are about to drop the column `contentType` on the `AutomatedModeration` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `Battle` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Battle` table. All the data in the column will be lost.
  - You are about to drop the column `actualBehavior` on the `BugReport` table. All the data in the column will be lost.
  - You are about to drop the column `assignedTo` on the `BugReport` table. All the data in the column will be lost.
  - You are about to drop the column `expectedBehavior` on the `BugReport` table. All the data in the column will be lost.
  - You are about to drop the column `stepsToReproduce` on the `BugReport` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `BugReport` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `certificateUrl` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `issueDate` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `exampleInput` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `exampleOutput` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `functionSignature` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `inputFormat` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `memoryLimit` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `outputFormat` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `timeLimit` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `challengeId` on the `ChallengeSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ChallengeSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `ChangeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ChangeHistory` table. All the data in the column will be lost.
  - You are about to drop the column `user1Id` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `CodeReview` table. All the data in the column will be lost.
  - You are about to drop the column `reviewerId` on the `CodeReview` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `CodingSandbox` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CodingSandbox` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `roadmapId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `CommunityChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `CommunityChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `challengeId` on the `CommunityChallengeSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CommunityChallengeSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `roadmapId` on the `Concept` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `ContentModeration` table. All the data in the column will be lost.
  - You are about to drop the column `contentId` on the `ContentModeration` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `ContentModeration` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `ContentModeration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ContentModeration` table. All the data in the column will be lost.
  - You are about to drop the column `curatorId` on the `ContentPlaylist` table. All the data in the column will be lost.
  - You are about to drop the column `contentId` on the `ContentReport` table. All the data in the column will be lost.
  - You are about to drop the column `contentType` on the `ContentReport` table. All the data in the column will be lost.
  - You are about to drop the column `reporterId` on the `ContentReport` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `DailyChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `DailyChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `streakBonus` on the `DailyChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `challengeId` on the `DailyChallengeSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `DailyChallengeSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `DailyTopic` table. All the data in the column will be lost.
  - You are about to drop the column `dailyTopicId` on the `DailyTopicCompletion` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpent` on the `DailyTopicCompletion` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `DailyTopicCompletion` table. All the data in the column will be lost.
  - You are about to drop the column `dailyTopicId` on the `DailyTopicView` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `DailyTopicView` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `DailyTopicView` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `EmailLog` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `EmailTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `EventRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EventRegistration` table. All the data in the column will be lost.
  - You are about to drop the column `isEnabled` on the `FeatureFlag` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `FeatureRequest` table. All the data in the column will be lost.
  - You are about to drop the column `featureRequestId` on the `FeatureRequestVote` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `FeatureRequestVote` table. All the data in the column will be lost.
  - You are about to drop the column `followerId` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the column `followingId` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Forum` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Forum` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `ForumComment` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `ForumComment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ForumComment` table. All the data in the column will be lost.
  - You are about to drop the column `forumId` on the `ForumPost` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ForumPost` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrls` on the `HardwareKit` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `HardwareKit` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `HelpArticle` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `InAppPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `itemType` on the `InAppPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `InAppPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `internshipId` on the `InternshipApplication` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `InternshipApplication` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `InternshipApplication` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `InterviewPrep` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `InterviewQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `deviceType` on the `IoTDevice` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeen` on the `IoTDevice` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `IoTDevice` table. All the data in the column will be lost.
  - You are about to drop the column `applicationDeadline` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `jobType` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `postedDate` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `deviceId` on the `LabSession` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `LabSession` table. All the data in the column will be lost.
  - You are about to drop the column `sensorData` on the `LabSession` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `LabSession` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LabSession` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `LeaderboardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `LeaderboardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `timeTaken` on the `LeaderboardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `LeaderboardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LeaderboardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `generatedAt` on the `LearningRecommendation` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedItemId` on the `LearningRecommendation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LearningRecommendation` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `commentId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `roadmapId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `roadmapId` on the `MainConcept` table. All the data in the column will be lost.
  - You are about to drop the column `menteeId` on the `Mentorship` table. All the data in the column will be lost.
  - You are about to drop the column `mentorId` on the `Mentorship` table. All the data in the column will be lost.
  - You are about to drop the column `mentorshipId` on the `MentorshipSession` table. All the data in the column will be lost.
  - You are about to drop the column `contentId` on the `ModerationLog` table. All the data in the column will be lost.
  - You are about to drop the column `contentType` on the `ModerationLog` table. All the data in the column will be lost.
  - You are about to drop the column `moderatorId` on the `ModerationLog` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Option` table. All the data in the column will be lost.
  - You are about to drop the column `isCorrect` on the `Option` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `Option` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Option` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PlacementBook` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `PlacementBook` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `PlacementBook` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PlacementBook` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `PlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PlacementTest` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `roadmapId` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `ProjectCollaboration` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `ProjectCollaboration` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `ProjectCollaboration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ProjectCollaboration` table. All the data in the column will be lost.
  - You are about to drop the column `correctAnswer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `quizId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `testCases` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `conceptId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `passingScore` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `timeLimit` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `isCorrect` on the `QuizAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `QuizAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `answerText` on the `QuizOption` table. All the data in the column will be lost.
  - You are about to drop the column `isCorrect` on the `QuizOption` table. All the data in the column will be lost.
  - You are about to drop the column `quizQuestionId` on the `QuizOption` table. All the data in the column will be lost.
  - You are about to drop the column `quizId` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `isPassed` on the `QuizSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `quizId` on the `QuizSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpent` on the `QuizSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `QuizSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `answerId` on the `QuizSubmissionAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `QuizSubmissionAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `submissionId` on the `QuizSubmissionAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `ResourceVersion` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Roadmap` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Roadmap` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Roadmap` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Roadmap` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Roadmap` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `SecurityAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `SecurityAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SecurityAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentDate` on the `SkillAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SkillAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `isPrivate` on the `StudyGroup` table. All the data in the column will be lost.
  - You are about to drop the column `maxMembers` on the `StudyGroup` table. All the data in the column will be lost.
  - You are about to drop the column `meetingSchedule` on the `StudyGroup` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `StudyGroup` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyGoal` on the `StudyGroup` table. All the data in the column will be lost.
  - You are about to drop the column `studyGroupId` on the `StudyGroupMember` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `StudyGroupMember` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `StudyGroupResource` table. All the data in the column will be lost.
  - You are about to drop the column `conceptId` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `SubmissionLog` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `SubmissionLog` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `assignedTo` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `SystemConfig` table. All the data in the column will be lost.
  - You are about to drop the column `teamProjectId` on the `TeamProjectMember` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TeamProjectMember` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `TechEvent` table. All the data in the column will be lost.
  - You are about to drop the column `maxAttendees` on the `TechEvent` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `TechEvent` table. All the data in the column will be lost.
  - You are about to drop the column `challengeId` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `isHidden` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `isInternal` on the `TicketResponse` table. All the data in the column will be lost.
  - You are about to drop the column `ticketId` on the `TicketResponse` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TicketResponse` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `originalId` on the `TranslatedContent` table. All the data in the column will be lost.
  - You are about to drop the column `accessibilityPrefs` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `githubStats` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `learningStreak` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `leetcodeStats` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredLanguage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserLearningAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyHours` on the `UserLearningAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `learningStyle` on the `UserLearningPreference` table. All the data in the column will be lost.
  - You are about to drop the column `skillLevel` on the `UserLearningPreference` table. All the data in the column will be lost.
  - You are about to drop the column `timeAvailability` on the `UserLearningPreference` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserLearningPreference` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserPoints` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `confidenceLevel` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `lastReviewed` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `progressPercentage` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpent` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserProgress` table. All the data in the column will be lost.
  - You are about to drop the column `isCustom` on the `UserRoadmap` table. All the data in the column will be lost.
  - You are about to drop the column `roadmapId` on the `UserRoadmap` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `UserRoadmap` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserRoadmap` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the column `highContrast` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `textSize` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `Version` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Version` table. All the data in the column will be lost.
  - You are about to drop the column `embedUrl` on the `VirtualLab` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `VirtualLab` table. All the data in the column will be lost.
  - You are about to drop the `ArticleVersion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,challenge_id]` on the table `DailyChallengeSubmission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,daily_topic_id]` on the table `DailyTopicView` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[feature_request_id,user_id]` on the table `FeatureRequestVote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[follower_id,following_id]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,article_id]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,roadmap_id]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,comment_id]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mentor_id,mentee_id]` on the table `Mentorship` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,topic_id]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,study_group_id]` on the table `StudyGroupMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,team_project_id]` on the table `TeamProjectMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[original_id,language]` on the table `TranslatedContent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `UserLearningAnalytics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `UserLearningPreference` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `UserPoints` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,topic_id]` on the table `UserProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,roadmap_id]` on the table `UserRoadmap` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `UserSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ip_address` to the `AccessLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_code` to the `AccessLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `earned_at` to the `Achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admin_id` to the `AdminAuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_id` to the `AdminAuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_id` to the `ApprovalHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewer_id` to the `ApprovalHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author_id` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_id` to the `AutomatedModeration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_type` to the `AutomatedModeration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `Battle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Battle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `BugReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `certificate_url` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `example_input` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `example_output` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `function_signature` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `input_format` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `output_format` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `challenge_id` to the `ChallengeSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ChallengeSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_id` to the `ChangeHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ChangeHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user1_id` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2_id` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author_id` to the `CodeReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewer_id` to the `CodeReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `CodingSandbox` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `CommunityChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `CommunityChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `challenge_id` to the `CommunityChallengeSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `CommunityChallengeSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roadmap_id` to the `Concept` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author_id` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_id` to the `ContentModeration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ContentModeration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `curator_id` to the `ContentPlaylist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_id` to the `ContentReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_type` to the `ContentReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reporter_id` to the `ContentReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `DailyChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `DailyChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `challenge_id` to the `DailyChallengeSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `DailyChallengeSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `DailyTopic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `daily_topic_id` to the `DailyTopicCompletion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `DailyTopicCompletion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `daily_topic_id` to the `DailyTopicView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `DailyTopicView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sent_at` to the `EmailLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_id` to the `EventRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `EventRegistration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `FeatureRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feature_request_id` to the `FeatureRequestVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `FeatureRequestVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `follower_id` to the `Follow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `following_id` to the `Follow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `Forum` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_id` to the `ForumComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ForumComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forum_id` to the `ForumPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ForumPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller_id` to the `HardwareKit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_id` to the `InAppPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_type` to the `InAppPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `InAppPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `internship_id` to the `InternshipApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resume_url` to the `InternshipApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `InternshipApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `InterviewPrep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device_type` to the `IoTDevice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_seen` to the `IoTDevice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `IoTDevice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device_id` to the `LabSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `LabSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sensor_data` to the `LabSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `LabSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `LabSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `LeaderboardEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_taken` to the `LeaderboardEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `LeaderboardEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `LeaderboardEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommended_item_id` to the `LearningRecommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `LearningRecommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roadmap_id` to the `MainConcept` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mentee_id` to the `Mentorship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mentor_id` to the `Mentorship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mentorship_id` to the `MentorshipSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_id` to the `ModerationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_type` to the `ModerationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moderator_id` to the `ModerationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_correct` to the `Option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `Option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_path` to the `PlacementBook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `PlacementBook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `PlacementBook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `PlacementTest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roadmap_id` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `ProjectCollaboration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `ProjectCollaboration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ProjectCollaboration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correct_answer` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quiz_id` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passing_score` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `QuizAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answer_text` to the `QuizOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_correct` to the `QuizOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quiz_question_id` to the `QuizOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quiz_id` to the `QuizQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_passed` to the `QuizSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quiz_id` to the `QuizSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_spent` to the `QuizSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `QuizSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answer_id` to the `QuizSubmissionAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `QuizSubmissionAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submission_id` to the `QuizSubmissionAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resource_id` to the `ResourceVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Roadmap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Roadmap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessment_date` to the `SkillAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `SkillAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `StudyGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `study_group_id` to the `StudyGroupMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `StudyGroupMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group_id` to the `StudyGroupResource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `concept_id` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `article_id` to the `SubmissionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author_id` to the `SubmissionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_project_id` to the `TeamProjectMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `TeamProjectMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `TechEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `TechEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `challenge_id` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticket_id` to the `TicketResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `TicketResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_id` to the `TranslatedContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserLearningAnalytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekly_hours` to the `UserLearningAnalytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skill_level` to the `UserLearningPreference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_availability` to the `UserLearningPreference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserLearningPreference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserPoints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roadmap_id` to the `UserRoadmap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic_id` to the `UserRoadmap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserRoadmap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `UserSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `UserSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `article_id` to the `Version` table without a default value. This is not possible if the table is not empty.
  - Added the required column `embed_url` to the `VirtualLab` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `VirtualLab` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AccessLog" DROP CONSTRAINT "AccessLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Achievement" DROP CONSTRAINT "Achievement_userId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "AdminAuditLog" DROP CONSTRAINT "AdminAuditLog_adminId_fkey";

-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- DropForeignKey
ALTER TABLE "ApprovalHistory" DROP CONSTRAINT "ApprovalHistory_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_topicId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleVersion" DROP CONSTRAINT "ArticleVersion_articleId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Battle" DROP CONSTRAINT "Battle_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Battle" DROP CONSTRAINT "Battle_userId_fkey";

-- DropForeignKey
ALTER TABLE "BugReport" DROP CONSTRAINT "BugReport_assignedTo_fkey";

-- DropForeignKey
ALTER TABLE "BugReport" DROP CONSTRAINT "BugReport_userId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_userId_fkey";

-- DropForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_topicId_fkey";

-- DropForeignKey
ALTER TABLE "ChallengeSubmission" DROP CONSTRAINT "ChallengeSubmission_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "ChallengeSubmission" DROP CONSTRAINT "ChallengeSubmission_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChangeHistory" DROP CONSTRAINT "ChangeHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_user2Id_fkey";

-- DropForeignKey
ALTER TABLE "CodeReview" DROP CONSTRAINT "CodeReview_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CodeReview" DROP CONSTRAINT "CodeReview_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "CodingSandbox" DROP CONSTRAINT "CodingSandbox_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "CommunityChallengeSubmission" DROP CONSTRAINT "CommunityChallengeSubmission_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "CommunityChallengeSubmission" DROP CONSTRAINT "CommunityChallengeSubmission_userId_fkey";

-- DropForeignKey
ALTER TABLE "Concept" DROP CONSTRAINT "Concept_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ContentModeration" DROP CONSTRAINT "ContentModeration_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ContentModeration" DROP CONSTRAINT "ContentModeration_contentId_fkey";

-- DropForeignKey
ALTER TABLE "ContentModeration" DROP CONSTRAINT "ContentModeration_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "ContentModeration" DROP CONSTRAINT "ContentModeration_topicId_fkey";

-- DropForeignKey
ALTER TABLE "ContentModeration" DROP CONSTRAINT "ContentModeration_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContentPlaylist" DROP CONSTRAINT "ContentPlaylist_curatorId_fkey";

-- DropForeignKey
ALTER TABLE "ContentReport" DROP CONSTRAINT "ContentReport_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "DailyChallengeSubmission" DROP CONSTRAINT "DailyChallengeSubmission_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "DailyChallengeSubmission" DROP CONSTRAINT "DailyChallengeSubmission_userId_fkey";

-- DropForeignKey
ALTER TABLE "DailyTopic" DROP CONSTRAINT "DailyTopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "DailyTopicCompletion" DROP CONSTRAINT "DailyTopicCompletion_dailyTopicId_fkey";

-- DropForeignKey
ALTER TABLE "DailyTopicCompletion" DROP CONSTRAINT "DailyTopicCompletion_userId_fkey";

-- DropForeignKey
ALTER TABLE "DailyTopicView" DROP CONSTRAINT "DailyTopicView_dailyTopicId_fkey";

-- DropForeignKey
ALTER TABLE "DailyTopicView" DROP CONSTRAINT "DailyTopicView_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventRegistration" DROP CONSTRAINT "EventRegistration_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventRegistration" DROP CONSTRAINT "EventRegistration_userId_fkey";

-- DropForeignKey
ALTER TABLE "FeatureRequest" DROP CONSTRAINT "FeatureRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "FeatureRequestVote" DROP CONSTRAINT "FeatureRequestVote_featureRequestId_fkey";

-- DropForeignKey
ALTER TABLE "FeatureRequestVote" DROP CONSTRAINT "FeatureRequestVote_userId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropForeignKey
ALTER TABLE "Forum" DROP CONSTRAINT "Forum_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "ForumComment" DROP CONSTRAINT "ForumComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "ForumComment" DROP CONSTRAINT "ForumComment_postId_fkey";

-- DropForeignKey
ALTER TABLE "ForumComment" DROP CONSTRAINT "ForumComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "ForumPost" DROP CONSTRAINT "ForumPost_forumId_fkey";

-- DropForeignKey
ALTER TABLE "ForumPost" DROP CONSTRAINT "ForumPost_userId_fkey";

-- DropForeignKey
ALTER TABLE "HardwareKit" DROP CONSTRAINT "HardwareKit_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "InAppPurchase" DROP CONSTRAINT "InAppPurchase_userId_fkey";

-- DropForeignKey
ALTER TABLE "InternshipApplication" DROP CONSTRAINT "InternshipApplication_internshipId_fkey";

-- DropForeignKey
ALTER TABLE "InternshipApplication" DROP CONSTRAINT "InternshipApplication_userId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewPrep" DROP CONSTRAINT "InterviewPrep_userId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewQuestion" DROP CONSTRAINT "InterviewQuestion_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "IoTDevice" DROP CONSTRAINT "IoTDevice_userId_fkey";

-- DropForeignKey
ALTER TABLE "LabSession" DROP CONSTRAINT "LabSession_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "LabSession" DROP CONSTRAINT "LabSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "LeaderboardEntry" DROP CONSTRAINT "LeaderboardEntry_userId_fkey";

-- DropForeignKey
ALTER TABLE "LearningRecommendation" DROP CONSTRAINT "LearningRecommendation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "MainConcept" DROP CONSTRAINT "MainConcept_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "Mentorship" DROP CONSTRAINT "Mentorship_menteeId_fkey";

-- DropForeignKey
ALTER TABLE "Mentorship" DROP CONSTRAINT "Mentorship_mentorId_fkey";

-- DropForeignKey
ALTER TABLE "MentorshipSession" DROP CONSTRAINT "MentorshipSession_mentorshipId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationLog" DROP CONSTRAINT "ModerationLog_moderatorId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_questionId_fkey";

-- DropForeignKey
ALTER TABLE "PlacementTest" DROP CONSTRAINT "PlacementTest_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_topicId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectCollaboration" DROP CONSTRAINT "ProjectCollaboration_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectCollaboration" DROP CONSTRAINT "ProjectCollaboration_userId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_conceptId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_topicId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizOption" DROP CONSTRAINT "QuizOption_quizQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmission" DROP CONSTRAINT "QuizSubmission_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmission" DROP CONSTRAINT "QuizSubmission_userId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmissionAnswer" DROP CONSTRAINT "QuizSubmissionAnswer_answerId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmissionAnswer" DROP CONSTRAINT "QuizSubmissionAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmissionAnswer" DROP CONSTRAINT "QuizSubmissionAnswer_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_userId_fkey";

-- DropForeignKey
ALTER TABLE "ResourceVersion" DROP CONSTRAINT "ResourceVersion_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "Roadmap" DROP CONSTRAINT "Roadmap_userId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_parentId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityAuditLog" DROP CONSTRAINT "SecurityAuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "SkillAssessment" DROP CONSTRAINT "SkillAssessment_userId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroup" DROP CONSTRAINT "StudyGroup_topicId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupMember" DROP CONSTRAINT "StudyGroupMember_studyGroupId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupMember" DROP CONSTRAINT "StudyGroupMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGroupResource" DROP CONSTRAINT "StudyGroupResource_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_conceptId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionLog" DROP CONSTRAINT "SubmissionLog_articleId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionLog" DROP CONSTRAINT "SubmissionLog_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "SupportTicket" DROP CONSTRAINT "SupportTicket_assignedTo_fkey";

-- DropForeignKey
ALTER TABLE "SupportTicket" DROP CONSTRAINT "SupportTicket_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeamProjectMember" DROP CONSTRAINT "TeamProjectMember_teamProjectId_fkey";

-- DropForeignKey
ALTER TABLE "TeamProjectMember" DROP CONSTRAINT "TeamProjectMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "TestCase" DROP CONSTRAINT "TestCase_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "TicketResponse" DROP CONSTRAINT "TicketResponse_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "TicketResponse" DROP CONSTRAINT "TicketResponse_userId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserActivityLog" DROP CONSTRAINT "UserActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserLearningAnalytics" DROP CONSTRAINT "UserLearningAnalytics_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserLearningPreference" DROP CONSTRAINT "UserLearningPreference_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserPoints" DROP CONSTRAINT "UserPoints_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProgress" DROP CONSTRAINT "UserProgress_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "UserProgress" DROP CONSTRAINT "UserProgress_topicId_fkey";

-- DropForeignKey
ALTER TABLE "UserProgress" DROP CONSTRAINT "UserProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserRoadmap" DROP CONSTRAINT "UserRoadmap_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "UserRoadmap" DROP CONSTRAINT "UserRoadmap_topicId_fkey";

-- DropForeignKey
ALTER TABLE "UserRoadmap" DROP CONSTRAINT "UserRoadmap_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSession" DROP CONSTRAINT "UserSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_userId_fkey";

-- DropForeignKey
ALTER TABLE "Version" DROP CONSTRAINT "Version_articleId_fkey";

-- DropForeignKey
ALTER TABLE "VirtualLab" DROP CONSTRAINT "VirtualLab_subjectId_fkey";

-- DropIndex
DROP INDEX "AccessLog_statusCode_idx";

-- DropIndex
DROP INDEX "AccessLog_userId_idx";

-- DropIndex
DROP INDEX "Achievement_userId_idx";

-- DropIndex
DROP INDEX "ActivityLog_userId_idx";

-- DropIndex
DROP INDEX "AdminAuditLog_adminId_idx";

-- DropIndex
DROP INDEX "ApiKey_expiresAt_idx";

-- DropIndex
DROP INDEX "ApiKey_userId_lastUsed_idx";

-- DropIndex
DROP INDEX "ApprovalHistory_contentId_idx";

-- DropIndex
DROP INDEX "ApprovalHistory_reviewerId_idx";

-- DropIndex
DROP INDEX "Article_authorId_idx";

-- DropIndex
DROP INDEX "Article_topicId_idx";

-- DropIndex
DROP INDEX "AuditLog_userId_idx";

-- DropIndex
DROP INDEX "BugReport_assignedTo_idx";

-- DropIndex
DROP INDEX "BugReport_userId_idx";

-- DropIndex
DROP INDEX "Challenge_topicId_idx";

-- DropIndex
DROP INDEX "ChangeHistory_entityId_idx";

-- DropIndex
DROP INDEX "ChangeHistory_userId_idx";

-- DropIndex
DROP INDEX "CodingSandbox_userId_language_idx";

-- DropIndex
DROP INDEX "Comment_articleId_idx";

-- DropIndex
DROP INDEX "Comment_parentId_idx";

-- DropIndex
DROP INDEX "Comment_roadmapId_idx";

-- DropIndex
DROP INDEX "Comment_userId_idx";

-- DropIndex
DROP INDEX "CommunityChallengeSubmission_challengeId_idx";

-- DropIndex
DROP INDEX "CommunityChallengeSubmission_userId_idx";

-- DropIndex
DROP INDEX "Concept_roadmapId_idx";

-- DropIndex
DROP INDEX "Content_authorId_idx";

-- DropIndex
DROP INDEX "ContentReport_contentId_idx";

-- DropIndex
DROP INDEX "ContentReport_reporterId_idx";

-- DropIndex
DROP INDEX "DailyChallengeSubmission_userId_challengeId_key";

-- DropIndex
DROP INDEX "DailyTopic_topicId_idx";

-- DropIndex
DROP INDEX "DailyTopicCompletion_dailyTopicId_idx";

-- DropIndex
DROP INDEX "DailyTopicCompletion_userId_idx";

-- DropIndex
DROP INDEX "DailyTopicView_dailyTopicId_idx";

-- DropIndex
DROP INDEX "DailyTopicView_userId_dailyTopicId_key";

-- DropIndex
DROP INDEX "DailyTopicView_userId_idx";

-- DropIndex
DROP INDEX "FeatureRequest_userId_idx";

-- DropIndex
DROP INDEX "FeatureRequestVote_featureRequestId_userId_key";

-- DropIndex
DROP INDEX "Follow_followerId_followingId_key";

-- DropIndex
DROP INDEX "HelpArticle_isPublished_idx";

-- DropIndex
DROP INDEX "LeaderboardEntry_subjectId_idx";

-- DropIndex
DROP INDEX "LeaderboardEntry_timeTaken_idx";

-- DropIndex
DROP INDEX "Like_articleId_idx";

-- DropIndex
DROP INDEX "Like_commentId_idx";

-- DropIndex
DROP INDEX "Like_roadmapId_idx";

-- DropIndex
DROP INDEX "Like_userId_articleId_key";

-- DropIndex
DROP INDEX "Like_userId_commentId_key";

-- DropIndex
DROP INDEX "Like_userId_roadmapId_key";

-- DropIndex
DROP INDEX "Mentorship_mentorId_menteeId_key";

-- DropIndex
DROP INDEX "ModerationLog_contentId_idx";

-- DropIndex
DROP INDEX "ModerationLog_moderatorId_idx";

-- DropIndex
DROP INDEX "PlacementBook_subjectId_idx";

-- DropIndex
DROP INDEX "PlacementTest_subjectId_idx";

-- DropIndex
DROP INDEX "PlacementTest_userId_idx";

-- DropIndex
DROP INDEX "Progress_roadmapId_status_idx";

-- DropIndex
DROP INDEX "Progress_userId_status_idx";

-- DropIndex
DROP INDEX "Progress_userId_topicId_key";

-- DropIndex
DROP INDEX "Question_quizId_idx";

-- DropIndex
DROP INDEX "Quiz_conceptId_idx";

-- DropIndex
DROP INDEX "Quiz_subjectId_idx";

-- DropIndex
DROP INDEX "Quiz_topicId_idx";

-- DropIndex
DROP INDEX "QuizQuestion_quizId_idx";

-- DropIndex
DROP INDEX "QuizSubmission_quizId_idx";

-- DropIndex
DROP INDEX "QuizSubmission_userId_idx";

-- DropIndex
DROP INDEX "Resource_userId_idx";

-- DropIndex
DROP INDEX "ResourceVersion_resourceId_idx";

-- DropIndex
DROP INDEX "Roadmap_deletedAt_idx";

-- DropIndex
DROP INDEX "Roadmap_userId_isPublic_idx";

-- DropIndex
DROP INDEX "Role_parentId_idx";

-- DropIndex
DROP INDEX "SecurityAuditLog_userId_idx";

-- DropIndex
DROP INDEX "StudyGroupMember_userId_studyGroupId_key";

-- DropIndex
DROP INDEX "Subject_conceptId_idx";

-- DropIndex
DROP INDEX "SubmissionLog_articleId_idx";

-- DropIndex
DROP INDEX "SubmissionLog_authorId_idx";

-- DropIndex
DROP INDEX "SupportTicket_assignedTo_idx";

-- DropIndex
DROP INDEX "SupportTicket_userId_idx";

-- DropIndex
DROP INDEX "TeamProjectMember_userId_teamProjectId_key";

-- DropIndex
DROP INDEX "TestCase_challengeId_idx";

-- DropIndex
DROP INDEX "TicketResponse_ticketId_idx";

-- DropIndex
DROP INDEX "TicketResponse_userId_idx";

-- DropIndex
DROP INDEX "Topic_subjectId_idx";

-- DropIndex
DROP INDEX "TranslatedContent_originalId_language_key";

-- DropIndex
DROP INDEX "User_deletedAt_idx";

-- DropIndex
DROP INDEX "User_roleId_idx";

-- DropIndex
DROP INDEX "UserActivityLog_userId_idx";

-- DropIndex
DROP INDEX "UserLearningAnalytics_userId_key";

-- DropIndex
DROP INDEX "UserLearningPreference_userId_key";

-- DropIndex
DROP INDEX "UserPoints_userId_key";

-- DropIndex
DROP INDEX "UserProgress_topicId_idx";

-- DropIndex
DROP INDEX "UserProgress_userId_idx";

-- DropIndex
DROP INDEX "UserProgress_userId_topicId_key";

-- DropIndex
DROP INDEX "UserRoadmap_topicId_idx";

-- DropIndex
DROP INDEX "UserRoadmap_userId_roadmapId_key";

-- DropIndex
DROP INDEX "UserSession_userId_idx";

-- DropIndex
DROP INDEX "UserSettings_userId_key";

-- DropIndex
DROP INDEX "Version_articleId_idx";

-- AlterTable
ALTER TABLE "AccessLog" DROP COLUMN "ipAddress",
DROP COLUMN "statusCode",
DROP COLUMN "userAgent",
DROP COLUMN "userId",
ADD COLUMN     "ip_address" TEXT NOT NULL,
ADD COLUMN     "status_code" INTEGER NOT NULL,
ADD COLUMN     "user_agent" TEXT,
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "earnedAt",
DROP COLUMN "userId",
ADD COLUMN     "earned_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "deviceType",
DROP COLUMN "userId",
ADD COLUMN     "device_type" "DeviceType" NOT NULL DEFAULT 'WEB',
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AdminAuditLog" DROP COLUMN "adminId",
DROP COLUMN "entityId",
DROP COLUMN "ipAddress",
DROP COLUMN "userAgent",
ADD COLUMN     "admin_id" TEXT NOT NULL,
ADD COLUMN     "entity_id" TEXT NOT NULL,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "user_agent" TEXT;

-- AlterTable
ALTER TABLE "AdminDashboard" DROP COLUMN "generatedAt",
ADD COLUMN     "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "lastUsed",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "last_used" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ApprovalHistory" DROP COLUMN "contentId",
DROP COLUMN "createdAt",
DROP COLUMN "reviewerId",
ADD COLUMN     "content_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reviewer_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "authorId",
DROP COLUMN "moderationNotes",
DROP COLUMN "resourceId",
DROP COLUMN "topicId",
ADD COLUMN     "author_id" TEXT NOT NULL,
ADD COLUMN     "resource_id" TEXT,
ADD COLUMN     "topic_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AutomatedModeration" DROP COLUMN "contentId",
DROP COLUMN "contentType",
ADD COLUMN     "content_id" TEXT NOT NULL,
ADD COLUMN     "content_type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Battle" DROP COLUMN "topicId",
DROP COLUMN "userId",
ADD COLUMN     "topic_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BugReport" DROP COLUMN "actualBehavior",
DROP COLUMN "assignedTo",
DROP COLUMN "expectedBehavior",
DROP COLUMN "stepsToReproduce",
DROP COLUMN "userId",
ADD COLUMN     "actual_behavior" TEXT,
ADD COLUMN     "assigned_to" TEXT,
ADD COLUMN     "expected_behavior" TEXT,
ADD COLUMN     "steps_to_reproduce" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "parentId",
ADD COLUMN     "parent_id" TEXT;

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "certificateUrl",
DROP COLUMN "courseId",
DROP COLUMN "expiryDate",
DROP COLUMN "issueDate",
DROP COLUMN "userId",
ADD COLUMN     "certificate_url" TEXT NOT NULL,
ADD COLUMN     "course_id" TEXT,
ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "exampleInput",
DROP COLUMN "exampleOutput",
DROP COLUMN "functionSignature",
DROP COLUMN "inputFormat",
DROP COLUMN "memoryLimit",
DROP COLUMN "outputFormat",
DROP COLUMN "timeLimit",
DROP COLUMN "topicId",
ADD COLUMN     "example_input" TEXT NOT NULL,
ADD COLUMN     "example_output" TEXT NOT NULL,
ADD COLUMN     "function_signature" TEXT NOT NULL,
ADD COLUMN     "input_format" TEXT NOT NULL,
ADD COLUMN     "memory_limit" INTEGER,
ADD COLUMN     "output_format" TEXT NOT NULL,
ADD COLUMN     "time_limit" INTEGER,
ADD COLUMN     "topic_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ChallengeSubmission" DROP COLUMN "challengeId",
DROP COLUMN "userId",
ADD COLUMN     "challenge_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ChangeHistory" DROP COLUMN "entityId",
DROP COLUMN "userId",
ADD COLUMN     "entity_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "user1Id",
DROP COLUMN "user2Id",
ADD COLUMN     "user1_id" TEXT NOT NULL,
ADD COLUMN     "user2_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CodeReview" DROP COLUMN "authorId",
DROP COLUMN "reviewerId",
ADD COLUMN     "author_id" TEXT NOT NULL,
ADD COLUMN     "reviewer_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CodingSandbox" DROP COLUMN "isPublic",
DROP COLUMN "userId",
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "articleId",
DROP COLUMN "parentId",
DROP COLUMN "roadmapId",
DROP COLUMN "userId",
ADD COLUMN     "article_id" TEXT,
ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "roadmap_id" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CommunityChallenge" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CommunityChallengeSubmission" DROP COLUMN "challengeId",
DROP COLUMN "userId",
ADD COLUMN     "challenge_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Concept" DROP COLUMN "roadmapId",
ADD COLUMN     "roadmap_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "authorId",
ADD COLUMN     "author_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContentModeration" DROP COLUMN "articleId",
DROP COLUMN "contentId",
DROP COLUMN "resourceId",
DROP COLUMN "topicId",
DROP COLUMN "userId",
ADD COLUMN     "article_id" TEXT,
ADD COLUMN     "content_id" TEXT NOT NULL,
ADD COLUMN     "resource_id" TEXT,
ADD COLUMN     "topic_id" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContentPlaylist" DROP COLUMN "curatorId",
ADD COLUMN     "curator_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContentReport" DROP COLUMN "contentId",
DROP COLUMN "contentType",
DROP COLUMN "reporterId",
ADD COLUMN     "content_id" TEXT NOT NULL,
ADD COLUMN     "content_type" TEXT NOT NULL,
ADD COLUMN     "reporter_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "start_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DailyChallenge" DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "streakBonus",
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "streak_bonus" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "DailyChallengeSubmission" DROP COLUMN "challengeId",
DROP COLUMN "userId",
ADD COLUMN     "challenge_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DailyTopic" DROP COLUMN "topicId",
ADD COLUMN     "topic_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DailyTopicCompletion" DROP COLUMN "dailyTopicId",
DROP COLUMN "timeSpent",
DROP COLUMN "userId",
ADD COLUMN     "daily_topic_id" TEXT NOT NULL,
ADD COLUMN     "time_spent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DailyTopicView" DROP COLUMN "dailyTopicId",
DROP COLUMN "userId",
DROP COLUMN "viewCount",
ADD COLUMN     "daily_topic_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "EmailLog" DROP COLUMN "sentAt",
ADD COLUMN     "sent_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EmailTemplate" DROP COLUMN "isActive",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "EventRegistration" DROP COLUMN "eventId",
DROP COLUMN "userId",
ADD COLUMN     "event_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeatureFlag" DROP COLUMN "isEnabled",
ADD COLUMN     "is_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FeatureRequest" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeatureRequestVote" DROP COLUMN "featureRequestId",
DROP COLUMN "userId",
ADD COLUMN     "feature_request_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Follow" DROP COLUMN "followerId",
DROP COLUMN "followingId",
ADD COLUMN     "follower_id" TEXT NOT NULL,
ADD COLUMN     "following_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Forum" DROP COLUMN "createdBy",
DROP COLUMN "isActive",
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ForumComment" DROP COLUMN "parentId",
DROP COLUMN "postId",
DROP COLUMN "userId",
ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "post_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ForumPost" DROP COLUMN "forumId",
DROP COLUMN "userId",
ADD COLUMN     "forum_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "HardwareKit" DROP COLUMN "imageUrls",
DROP COLUMN "sellerId",
ADD COLUMN     "image_urls" TEXT[],
ADD COLUMN     "seller_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "HelpArticle" DROP COLUMN "isPublished",
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "InAppPurchase" DROP COLUMN "itemId",
DROP COLUMN "itemType",
DROP COLUMN "userId",
ADD COLUMN     "item_id" TEXT NOT NULL,
ADD COLUMN     "item_type" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InternshipApplication" DROP COLUMN "internshipId",
DROP COLUMN "resumeUrl",
DROP COLUMN "userId",
ADD COLUMN     "internship_id" TEXT NOT NULL,
ADD COLUMN     "resume_url" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InterviewPrep" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InterviewQuestion" DROP COLUMN "resourceId",
ADD COLUMN     "resource_id" TEXT;

-- AlterTable
ALTER TABLE "IoTDevice" DROP COLUMN "deviceType",
DROP COLUMN "lastSeen",
DROP COLUMN "userId",
ADD COLUMN     "device_type" TEXT NOT NULL,
ADD COLUMN     "last_seen" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "applicationDeadline",
DROP COLUMN "jobType",
DROP COLUMN "postedDate",
ADD COLUMN     "application_deadline" TIMESTAMP(3),
ADD COLUMN     "job_type" "JobType",
ADD COLUMN     "posted_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LabSession" DROP COLUMN "deviceId",
DROP COLUMN "endTime",
DROP COLUMN "sensorData",
DROP COLUMN "startTime",
DROP COLUMN "userId",
ADD COLUMN     "device_id" TEXT NOT NULL,
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sensor_data" JSONB NOT NULL,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LeaderboardEntry" DROP COLUMN "createdAt",
DROP COLUMN "subjectId",
DROP COLUMN "timeTaken",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "subject_id" TEXT NOT NULL,
ADD COLUMN     "time_taken" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LearningRecommendation" DROP COLUMN "generatedAt",
DROP COLUMN "recommendedItemId",
DROP COLUMN "userId",
ADD COLUMN     "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "recommended_item_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "articleId",
DROP COLUMN "commentId",
DROP COLUMN "createdAt",
DROP COLUMN "roadmapId",
DROP COLUMN "userId",
ADD COLUMN     "article_id" TEXT,
ADD COLUMN     "comment_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "roadmap_id" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MainConcept" DROP COLUMN "roadmapId",
ADD COLUMN     "roadmap_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Mentorship" DROP COLUMN "menteeId",
DROP COLUMN "mentorId",
ADD COLUMN     "mentee_id" TEXT NOT NULL,
ADD COLUMN     "mentor_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MentorshipSession" DROP COLUMN "mentorshipId",
ADD COLUMN     "mentorship_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ModerationLog" DROP COLUMN "contentId",
DROP COLUMN "contentType",
DROP COLUMN "moderatorId",
ADD COLUMN     "content_id" TEXT NOT NULL,
ADD COLUMN     "content_type" TEXT NOT NULL,
ADD COLUMN     "moderator_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "isRead",
DROP COLUMN "userId",
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Option" DROP COLUMN "createdAt",
DROP COLUMN "isCorrect",
DROP COLUMN "questionId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_correct" BOOLEAN NOT NULL,
ADD COLUMN     "question_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PlacementBook" DROP COLUMN "createdAt",
DROP COLUMN "filePath",
DROP COLUMN "subjectId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "subject_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PlacementTest" DROP COLUMN "createdAt",
DROP COLUMN "subjectId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "subject_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Progress" DROP COLUMN "createdAt",
DROP COLUMN "roadmapId",
DROP COLUMN "topicId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "roadmap_id" TEXT NOT NULL,
ADD COLUMN     "topic_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProjectCollaboration" DROP COLUMN "endDate",
DROP COLUMN "projectId",
DROP COLUMN "startDate",
DROP COLUMN "userId",
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "project_id" TEXT NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correctAnswer",
DROP COLUMN "quizId",
DROP COLUMN "testCases",
ADD COLUMN     "correct_answer" TEXT NOT NULL,
ADD COLUMN     "quiz_id" TEXT NOT NULL,
ADD COLUMN     "test_cases" JSONB;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "conceptId",
DROP COLUMN "passingScore",
DROP COLUMN "subjectId",
DROP COLUMN "timeLimit",
DROP COLUMN "topicId",
ADD COLUMN     "concept_id" TEXT,
ADD COLUMN     "passing_score" INTEGER NOT NULL,
ADD COLUMN     "subject_id" TEXT,
ADD COLUMN     "time_limit" INTEGER,
ADD COLUMN     "topic_id" TEXT;

-- AlterTable
ALTER TABLE "QuizAnswer" DROP COLUMN "isCorrect",
DROP COLUMN "questionId",
ADD COLUMN     "is_correct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "question_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizOption" DROP COLUMN "answerText",
DROP COLUMN "isCorrect",
DROP COLUMN "quizQuestionId",
ADD COLUMN     "answer_text" TEXT NOT NULL,
ADD COLUMN     "is_correct" BOOLEAN NOT NULL,
ADD COLUMN     "quiz_question_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizQuestion" DROP COLUMN "quizId",
ADD COLUMN     "quiz_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizSubmission" DROP COLUMN "isPassed",
DROP COLUMN "quizId",
DROP COLUMN "timeSpent",
DROP COLUMN "userId",
ADD COLUMN     "is_passed" BOOLEAN NOT NULL,
ADD COLUMN     "quiz_id" TEXT NOT NULL,
ADD COLUMN     "time_spent" INTEGER NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizSubmissionAnswer" DROP COLUMN "answerId",
DROP COLUMN "questionId",
DROP COLUMN "submissionId",
ADD COLUMN     "answer_id" TEXT NOT NULL,
ADD COLUMN     "question_id" TEXT NOT NULL,
ADD COLUMN     "submission_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ResourceVersion" DROP COLUMN "resourceId",
ADD COLUMN     "resource_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Roadmap" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "isPublic",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "parentId",
ADD COLUMN     "parent_id" TEXT;

-- AlterTable
ALTER TABLE "SecurityAuditLog" DROP COLUMN "ipAddress",
DROP COLUMN "userAgent",
DROP COLUMN "userId",
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "user_agent" TEXT,
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "SkillAssessment" DROP COLUMN "assessmentDate",
DROP COLUMN "userId",
ADD COLUMN     "assessment_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudyGroup" DROP COLUMN "isPrivate",
DROP COLUMN "maxMembers",
DROP COLUMN "meetingSchedule",
DROP COLUMN "topicId",
DROP COLUMN "weeklyGoal",
ADD COLUMN     "is_private" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_members" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "meeting_schedule" TEXT,
ADD COLUMN     "topic_id" TEXT NOT NULL,
ADD COLUMN     "weekly_goal" TEXT;

-- AlterTable
ALTER TABLE "StudyGroupMember" DROP COLUMN "studyGroupId",
DROP COLUMN "userId",
ADD COLUMN     "study_group_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudyGroupResource" DROP COLUMN "groupId",
ADD COLUMN     "group_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "conceptId",
ADD COLUMN     "concept_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SubmissionLog" DROP COLUMN "articleId",
DROP COLUMN "authorId",
ADD COLUMN     "article_id" TEXT NOT NULL,
ADD COLUMN     "author_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "userId",
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SupportTicket" DROP COLUMN "assignedTo",
DROP COLUMN "userId",
ADD COLUMN     "assigned_to" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SystemConfig" DROP COLUMN "isActive",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TeamProjectMember" DROP COLUMN "teamProjectId",
DROP COLUMN "userId",
ADD COLUMN     "team_project_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TechEvent" DROP COLUMN "endTime",
DROP COLUMN "maxAttendees",
DROP COLUMN "startTime",
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "max_attendees" INTEGER,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "challengeId",
DROP COLUMN "isHidden",
ADD COLUMN     "challenge_id" TEXT NOT NULL,
ADD COLUMN     "is_hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TicketResponse" DROP COLUMN "isInternal",
DROP COLUMN "ticketId",
DROP COLUMN "userId",
ADD COLUMN     "is_internal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ticket_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "subjectId",
ADD COLUMN     "subject_id" TEXT;

-- AlterTable
ALTER TABLE "TranslatedContent" DROP COLUMN "originalId",
ADD COLUMN     "original_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accessibilityPrefs",
DROP COLUMN "deletedAt",
DROP COLUMN "githubStats",
DROP COLUMN "isVerified",
DROP COLUMN "learningStreak",
DROP COLUMN "leetcodeStats",
DROP COLUMN "preferredLanguage",
DROP COLUMN "roleId",
ADD COLUMN     "accessibility_prefs" JSONB,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "github_stats" JSONB,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "learning_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "leetcode_stats" JSONB,
ADD COLUMN     "preferred_language" TEXT,
ADD COLUMN     "role_id" TEXT;

-- AlterTable
ALTER TABLE "UserActivityLog" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserLearningAnalytics" DROP COLUMN "userId",
DROP COLUMN "weeklyHours",
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "weekly_hours" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "UserLearningPreference" DROP COLUMN "learningStyle",
DROP COLUMN "skillLevel",
DROP COLUMN "timeAvailability",
DROP COLUMN "userId",
ADD COLUMN     "learning_style" TEXT[],
ADD COLUMN     "skill_level" TEXT NOT NULL,
ADD COLUMN     "time_availability" INTEGER NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserPoints" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserProgress" DROP COLUMN "completedAt",
DROP COLUMN "confidenceLevel",
DROP COLUMN "isCompleted",
DROP COLUMN "lastReviewed",
DROP COLUMN "progressPercentage",
DROP COLUMN "subjectId",
DROP COLUMN "timeSpent",
DROP COLUMN "topicId",
DROP COLUMN "userId",
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "confidence_level" SMALLINT DEFAULT NULL,
ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_reviewed" TIMESTAMP(3),
ADD COLUMN     "progress_percentage" SMALLINT DEFAULT NULL,
ADD COLUMN     "subject_id" TEXT,
ADD COLUMN     "time_spent" INTEGER,
ADD COLUMN     "topic_id" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserRoadmap" DROP COLUMN "isCustom",
DROP COLUMN "roadmapId",
DROP COLUMN "topicId",
DROP COLUMN "userId",
ADD COLUMN     "is_custom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roadmap_id" TEXT NOT NULL,
ADD COLUMN     "topic_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserSession" DROP COLUMN "createdAt",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_time" TIMESTAMP(3),
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "highContrast",
DROP COLUMN "textSize",
DROP COLUMN "userId",
ADD COLUMN     "high_contrast" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "text_size" INTEGER NOT NULL DEFAULT 16,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Version" DROP COLUMN "articleId",
DROP COLUMN "createdAt",
ADD COLUMN     "article_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "VirtualLab" DROP COLUMN "embedUrl",
DROP COLUMN "subjectId",
ADD COLUMN     "embed_url" TEXT NOT NULL,
ADD COLUMN     "subject_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "ArticleVersion";

-- CreateIndex
CREATE INDEX "AccessLog_user_id_idx" ON "AccessLog"("user_id");

-- CreateIndex
CREATE INDEX "AccessLog_status_code_idx" ON "AccessLog"("status_code");

-- CreateIndex
CREATE INDEX "Achievement_user_id_idx" ON "Achievement"("user_id");

-- CreateIndex
CREATE INDEX "ActivityLog_user_id_idx" ON "ActivityLog"("user_id");

-- CreateIndex
CREATE INDEX "AdminAuditLog_admin_id_idx" ON "AdminAuditLog"("admin_id");

-- CreateIndex
CREATE INDEX "ApiKey_user_id_last_used_idx" ON "ApiKey"("user_id", "last_used");

-- CreateIndex
CREATE INDEX "ApiKey_expires_at_idx" ON "ApiKey"("expires_at");

-- CreateIndex
CREATE INDEX "ApprovalHistory_content_id_idx" ON "ApprovalHistory"("content_id");

-- CreateIndex
CREATE INDEX "ApprovalHistory_reviewer_id_idx" ON "ApprovalHistory"("reviewer_id");

-- CreateIndex
CREATE INDEX "Article_author_id_idx" ON "Article"("author_id");

-- CreateIndex
CREATE INDEX "Article_topic_id_idx" ON "Article"("topic_id");

-- CreateIndex
CREATE INDEX "AuditLog_user_id_idx" ON "AuditLog"("user_id");

-- CreateIndex
CREATE INDEX "BugReport_user_id_idx" ON "BugReport"("user_id");

-- CreateIndex
CREATE INDEX "BugReport_assigned_to_idx" ON "BugReport"("assigned_to");

-- CreateIndex
CREATE INDEX "Challenge_topic_id_idx" ON "Challenge"("topic_id");

-- CreateIndex
CREATE INDEX "ChangeHistory_entity_id_idx" ON "ChangeHistory"("entity_id");

-- CreateIndex
CREATE INDEX "ChangeHistory_user_id_idx" ON "ChangeHistory"("user_id");

-- CreateIndex
CREATE INDEX "CodingSandbox_user_id_language_idx" ON "CodingSandbox"("user_id", "language");

-- CreateIndex
CREATE INDEX "Comment_user_id_idx" ON "Comment"("user_id");

-- CreateIndex
CREATE INDEX "Comment_roadmap_id_idx" ON "Comment"("roadmap_id");

-- CreateIndex
CREATE INDEX "Comment_article_id_idx" ON "Comment"("article_id");

-- CreateIndex
CREATE INDEX "Comment_parent_id_idx" ON "Comment"("parent_id");

-- CreateIndex
CREATE INDEX "CommunityChallengeSubmission_challenge_id_idx" ON "CommunityChallengeSubmission"("challenge_id");

-- CreateIndex
CREATE INDEX "CommunityChallengeSubmission_user_id_idx" ON "CommunityChallengeSubmission"("user_id");

-- CreateIndex
CREATE INDEX "Concept_roadmap_id_idx" ON "Concept"("roadmap_id");

-- CreateIndex
CREATE INDEX "Content_author_id_idx" ON "Content"("author_id");

-- CreateIndex
CREATE INDEX "ContentReport_content_id_idx" ON "ContentReport"("content_id");

-- CreateIndex
CREATE INDEX "ContentReport_reporter_id_idx" ON "ContentReport"("reporter_id");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallengeSubmission_user_id_challenge_id_key" ON "DailyChallengeSubmission"("user_id", "challenge_id");

-- CreateIndex
CREATE INDEX "DailyTopic_topic_id_idx" ON "DailyTopic"("topic_id");

-- CreateIndex
CREATE INDEX "DailyTopicCompletion_user_id_idx" ON "DailyTopicCompletion"("user_id");

-- CreateIndex
CREATE INDEX "DailyTopicCompletion_daily_topic_id_idx" ON "DailyTopicCompletion"("daily_topic_id");

-- CreateIndex
CREATE INDEX "DailyTopicView_user_id_idx" ON "DailyTopicView"("user_id");

-- CreateIndex
CREATE INDEX "DailyTopicView_daily_topic_id_idx" ON "DailyTopicView"("daily_topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTopicView_user_id_daily_topic_id_key" ON "DailyTopicView"("user_id", "daily_topic_id");

-- CreateIndex
CREATE INDEX "FeatureRequest_user_id_idx" ON "FeatureRequest"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureRequestVote_feature_request_id_user_id_key" ON "FeatureRequestVote"("feature_request_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_follower_id_following_id_key" ON "Follow"("follower_id", "following_id");

-- CreateIndex
CREATE INDEX "HelpArticle_is_published_idx" ON "HelpArticle"("is_published");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_subject_id_idx" ON "LeaderboardEntry"("subject_id");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_time_taken_idx" ON "LeaderboardEntry"("time_taken");

-- CreateIndex
CREATE INDEX "Like_article_id_idx" ON "Like"("article_id");

-- CreateIndex
CREATE INDEX "Like_roadmap_id_idx" ON "Like"("roadmap_id");

-- CreateIndex
CREATE INDEX "Like_comment_id_idx" ON "Like"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Like_user_id_article_id_key" ON "Like"("user_id", "article_id");

-- CreateIndex
CREATE UNIQUE INDEX "Like_user_id_roadmap_id_key" ON "Like"("user_id", "roadmap_id");

-- CreateIndex
CREATE UNIQUE INDEX "Like_user_id_comment_id_key" ON "Like"("user_id", "comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Mentorship_mentor_id_mentee_id_key" ON "Mentorship"("mentor_id", "mentee_id");

-- CreateIndex
CREATE INDEX "ModerationLog_content_id_idx" ON "ModerationLog"("content_id");

-- CreateIndex
CREATE INDEX "ModerationLog_moderator_id_idx" ON "ModerationLog"("moderator_id");

-- CreateIndex
CREATE INDEX "PlacementBook_subject_id_idx" ON "PlacementBook"("subject_id");

-- CreateIndex
CREATE INDEX "PlacementTest_user_id_idx" ON "PlacementTest"("user_id");

-- CreateIndex
CREATE INDEX "PlacementTest_subject_id_idx" ON "PlacementTest"("subject_id");

-- CreateIndex
CREATE INDEX "Progress_user_id_status_idx" ON "Progress"("user_id", "status");

-- CreateIndex
CREATE INDEX "Progress_roadmap_id_status_idx" ON "Progress"("roadmap_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_user_id_topic_id_key" ON "Progress"("user_id", "topic_id");

-- CreateIndex
CREATE INDEX "Question_quiz_id_idx" ON "Question"("quiz_id");

-- CreateIndex
CREATE INDEX "Quiz_topic_id_idx" ON "Quiz"("topic_id");

-- CreateIndex
CREATE INDEX "Quiz_subject_id_idx" ON "Quiz"("subject_id");

-- CreateIndex
CREATE INDEX "Quiz_concept_id_idx" ON "Quiz"("concept_id");

-- CreateIndex
CREATE INDEX "QuizQuestion_quiz_id_idx" ON "QuizQuestion"("quiz_id");

-- CreateIndex
CREATE INDEX "QuizSubmission_user_id_idx" ON "QuizSubmission"("user_id");

-- CreateIndex
CREATE INDEX "QuizSubmission_quiz_id_idx" ON "QuizSubmission"("quiz_id");

-- CreateIndex
CREATE INDEX "Resource_user_id_idx" ON "Resource"("user_id");

-- CreateIndex
CREATE INDEX "ResourceVersion_resource_id_idx" ON "ResourceVersion"("resource_id");

-- CreateIndex
CREATE INDEX "Roadmap_user_id_is_public_idx" ON "Roadmap"("user_id", "is_public");

-- CreateIndex
CREATE INDEX "Roadmap_deleted_at_idx" ON "Roadmap"("deleted_at");

-- CreateIndex
CREATE INDEX "Role_parent_id_idx" ON "Role"("parent_id");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_user_id_idx" ON "SecurityAuditLog"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudyGroupMember_user_id_study_group_id_key" ON "StudyGroupMember"("user_id", "study_group_id");

-- CreateIndex
CREATE INDEX "Subject_concept_id_idx" ON "Subject"("concept_id");

-- CreateIndex
CREATE INDEX "SubmissionLog_author_id_idx" ON "SubmissionLog"("author_id");

-- CreateIndex
CREATE INDEX "SubmissionLog_article_id_idx" ON "SubmissionLog"("article_id");

-- CreateIndex
CREATE INDEX "SupportTicket_user_id_idx" ON "SupportTicket"("user_id");

-- CreateIndex
CREATE INDEX "SupportTicket_assigned_to_idx" ON "SupportTicket"("assigned_to");

-- CreateIndex
CREATE UNIQUE INDEX "TeamProjectMember_user_id_team_project_id_key" ON "TeamProjectMember"("user_id", "team_project_id");

-- CreateIndex
CREATE INDEX "TestCase_challenge_id_idx" ON "TestCase"("challenge_id");

-- CreateIndex
CREATE INDEX "TicketResponse_ticket_id_idx" ON "TicketResponse"("ticket_id");

-- CreateIndex
CREATE INDEX "TicketResponse_user_id_idx" ON "TicketResponse"("user_id");

-- CreateIndex
CREATE INDEX "Topic_subject_id_idx" ON "Topic"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "TranslatedContent_original_id_language_key" ON "TranslatedContent"("original_id", "language");

-- CreateIndex
CREATE INDEX "User_role_id_idx" ON "User"("role_id");

-- CreateIndex
CREATE INDEX "User_deleted_at_idx" ON "User"("deleted_at");

-- CreateIndex
CREATE INDEX "UserActivityLog_user_id_idx" ON "UserActivityLog"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningAnalytics_user_id_key" ON "UserLearningAnalytics"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningPreference_user_id_key" ON "UserLearningPreference"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPoints_user_id_key" ON "UserPoints"("user_id");

-- CreateIndex
CREATE INDEX "UserProgress_user_id_idx" ON "UserProgress"("user_id");

-- CreateIndex
CREATE INDEX "UserProgress_topic_id_idx" ON "UserProgress"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_user_id_topic_id_key" ON "UserProgress"("user_id", "topic_id");

-- CreateIndex
CREATE INDEX "UserRoadmap_topic_id_idx" ON "UserRoadmap"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoadmap_user_id_roadmap_id_key" ON "UserRoadmap"("user_id", "roadmap_id");

-- CreateIndex
CREATE INDEX "UserSession_user_id_idx" ON "UserSession"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_user_id_key" ON "UserSettings"("user_id");

-- CreateIndex
CREATE INDEX "Version_article_id_idx" ON "Version"("article_id");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionLog" ADD CONSTRAINT "SubmissionLog_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionLog" ADD CONSTRAINT "SubmissionLog_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forum" ADD CONSTRAINT "Forum_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MainConcept" ADD CONSTRAINT "MainConcept_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "Roadmap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "Concept"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmissionAnswer" ADD CONSTRAINT "QuizSubmissionAnswer_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "QuizSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmissionAnswer" ADD CONSTRAINT "QuizSubmissionAnswer_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "QuizAnswer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmissionAnswer" ADD CONSTRAINT "QuizSubmissionAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concept" ADD CONSTRAINT "Concept_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPoints" ADD CONSTRAINT "UserPoints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoadmap" ADD CONSTRAINT "UserRoadmap_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoadmap" ADD CONSTRAINT "UserRoadmap_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "Roadmap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoadmap" ADD CONSTRAINT "UserRoadmap_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamProjectMember" ADD CONSTRAINT "TeamProjectMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamProjectMember" ADD CONSTRAINT "TeamProjectMember_team_project_id_fkey" FOREIGN KEY ("team_project_id") REFERENCES "TeamProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "Forum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "ForumPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "ForumComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_mentee_id_fkey" FOREIGN KEY ("mentee_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroup" ADD CONSTRAINT "StudyGroup_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupResource" ADD CONSTRAINT "StudyGroupResource_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupMember" ADD CONSTRAINT "StudyGroupMember_study_group_id_fkey" FOREIGN KEY ("study_group_id") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTopic" ADD CONSTRAINT "DailyTopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTopicView" ADD CONSTRAINT "DailyTopicView_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTopicView" ADD CONSTRAINT "DailyTopicView_daily_topic_id_fkey" FOREIGN KEY ("daily_topic_id") REFERENCES "DailyTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTopicCompletion" ADD CONSTRAINT "DailyTopicCompletion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTopicCompletion" ADD CONSTRAINT "DailyTopicCompletion_daily_topic_id_fkey" FOREIGN KEY ("daily_topic_id") REFERENCES "DailyTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityLog" ADD CONSTRAINT "UserActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReport" ADD CONSTRAINT "ContentReport_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityAuditLog" ADD CONSTRAINT "SecurityAuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeHistory" ADD CONSTRAINT "ChangeHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketResponse" ADD CONSTRAINT "TicketResponse_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketResponse" ADD CONSTRAINT "TicketResponse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BugReport" ADD CONSTRAINT "BugReport_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequest" ADD CONSTRAINT "FeatureRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequestVote" ADD CONSTRAINT "FeatureRequestVote_feature_request_id_fkey" FOREIGN KEY ("feature_request_id") REFERENCES "FeatureRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequestVote" ADD CONSTRAINT "FeatureRequestVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalHistory" ADD CONSTRAINT "ApprovalHistory_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningPreference" ADD CONSTRAINT "UserLearningPreference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingSandbox" ADD CONSTRAINT "CodingSandbox_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualLab" ADD CONSTRAINT "VirtualLab_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipApplication" ADD CONSTRAINT "InternshipApplication_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipApplication" ADD CONSTRAINT "InternshipApplication_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "Internship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "TechEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecommendation" ADD CONSTRAINT "LearningRecommendation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HardwareKit" ADD CONSTRAINT "HardwareKit_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCollaboration" ADD CONSTRAINT "ProjectCollaboration_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCollaboration" ADD CONSTRAINT "ProjectCollaboration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallengeSubmission" ADD CONSTRAINT "DailyChallengeSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallengeSubmission" ADD CONSTRAINT "DailyChallengeSubmission_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "DailyChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewPrep" ADD CONSTRAINT "InterviewPrep_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAssessment" ADD CONSTRAINT "SkillAssessment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPlaylist" ADD CONSTRAINT "ContentPlaylist_curator_id_fkey" FOREIGN KEY ("curator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceVersion" ADD CONSTRAINT "ResourceVersion_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InAppPurchase" ADD CONSTRAINT "InAppPurchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningAnalytics" ADD CONSTRAINT "UserLearningAnalytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IoTDevice" ADD CONSTRAINT "IoTDevice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSession" ADD CONSTRAINT "LabSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSession" ADD CONSTRAINT "LabSession_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "IoTDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityChallengeSubmission" ADD CONSTRAINT "CommunityChallengeSubmission_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "CommunityChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityChallengeSubmission" ADD CONSTRAINT "CommunityChallengeSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_mentorship_id_fkey" FOREIGN KEY ("mentorship_id") REFERENCES "Mentorship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementTest" ADD CONSTRAINT "PlacementTest_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModeration" ADD CONSTRAINT "ContentModeration_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModeration" ADD CONSTRAINT "ContentModeration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModeration" ADD CONSTRAINT "ContentModeration_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModeration" ADD CONSTRAINT "ContentModeration_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentModeration" ADD CONSTRAINT "ContentModeration_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
