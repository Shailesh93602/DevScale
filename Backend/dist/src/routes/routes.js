"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutes = void 0;
const express_1 = require("express");
const userRoutes_1 = require("./userRoutes");
const adminRoutes_1 = require("./adminRoutes");
const analyticsRoutes_1 = require("./analyticsRoutes");
const roadMapRoutes_1 = require("./roadMapRoutes");
const articleRoutes_1 = require("./articleRoutes");
const resourceRoutes_1 = require("./resourceRoutes");
const challengeRoutes_1 = require("./challengeRoutes");
const topicRoutes_1 = require("./topicRoutes");
const subjectRoutes_1 = require("./subjectRoutes");
const mainConceptRoutes_1 = require("./mainConceptRoutes");
const healthCheckRoutes_1 = require("./healthCheckRoutes");
class AppRoutes {
    router;
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Health check route
        this.router.use('/health', new healthCheckRoutes_1.HealthCheckRoutes().getRouter());
        // Feature routes
        this.router.use('/users', new userRoutes_1.UserRoutes().getRouter());
        this.router.use('/admin', new adminRoutes_1.AdminRoutes().getRouter());
        this.router.use('/analytics', new analyticsRoutes_1.AnalyticsRoutes().getRouter());
        this.router.use('/roadMaps', new roadMapRoutes_1.RoadMapRoutes().getRouter());
        this.router.use('/articles', new articleRoutes_1.ArticleRoutes().getRouter());
        this.router.use('/resources', new resourceRoutes_1.ResourceRoutes().getRouter());
        this.router.use('/challenges', new challengeRoutes_1.ChallengeRoutes().getRouter());
        this.router.use('/topics', new topicRoutes_1.TopicRoutes().getRouter());
        this.router.use('/subjects', new subjectRoutes_1.SubjectRoutes().getRouter());
        this.router.use('/mainConcepts', new mainConceptRoutes_1.MainConceptRoutes().getRouter());
    }
    getRouter() {
        return this.router;
    }
}
exports.AppRoutes = AppRoutes;
//# sourceMappingURL=routes.js.map