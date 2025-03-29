"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const jobControllers_1 = __importDefault(require("../controllers/jobControllers"));
const authMiddleware_1 = require("@/middlewares/authMiddleware");
class JobRoutes extends BaseRouter_1.BaseRouter {
    jobController;
    constructor() {
        super();
        this.jobController = new jobControllers_1.default();
        this.router.use(authMiddleware_1.authMiddleware);
    }
    initializeRoutes() {
        this.router.get('/', this.jobController.getJobs);
        this.router.get('/:id', this.jobController.getJob);
        this.router.post('/create', this.jobController.createJob);
        this.router.put('/update/:id', this.jobController.updateJob);
        this.router.delete('/delete/:id', this.jobController.deleteJob);
    }
}
exports.JobRoutes = JobRoutes;
exports.default = new JobRoutes().getRouter();
//# sourceMappingURL=jobRoutes.js.map