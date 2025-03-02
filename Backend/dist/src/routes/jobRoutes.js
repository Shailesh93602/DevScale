"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobControllers_js_1 = require("../controllers/jobControllers.js");
const router = express_1.default.Router();
router.get('/', jobControllers_js_1.getJobs);
router.get('/:id', jobControllers_js_1.getJob);
router.post('/create', jobControllers_js_1.createJob);
router.put('/update/:id', jobControllers_js_1.updateJob);
router.delete('/delete/:id', jobControllers_js_1.deleteJob);
exports.default = router;
//# sourceMappingURL=jobRoutes.js.map