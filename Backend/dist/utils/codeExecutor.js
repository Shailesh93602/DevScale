"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCode = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const logger_1 = __importDefault(require("./logger"));
const errorHandler_1 = require("./errorHandler");
const executeCode = async (params) => {
    try {
        // Using Judge0 API for code execution
        const response = await axios_1.default.post('https://judge0-ce.p.rapidapi.com/submissions', {
            source_code: params.code,
            language_id: getLanguageId(params.language),
            stdin: params.input,
            cpu_time_limit: params.timeLimit || 2,
            memory_limit: params.memoryLimit || 128000,
        }, {
            headers: {
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key': config_1.COMPILER_CLIENT_SECRET,
            },
        });
        const { token } = response.data;
        // Poll for results
        const result = await pollSubmissionResult(token);
        return {
            output: result.stdout || result.stderr || '',
            executionTime: result.time,
            memoryUsed: result.memory,
        };
    }
    catch (error) {
        logger_1.default.error('Code execution error:', error);
        throw (0, errorHandler_1.createAppError)('Failed to execute code', 500);
    }
};
exports.executeCode = executeCode;
const pollSubmissionResult = async (token, maxAttempts = 10) => {
    for (let i = 0; i < maxAttempts; i++) {
        const response = await axios_1.default.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
            headers: {
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key': config_1.COMPILER_CLIENT_SECRET,
            },
        });
        if (response.data.status.id >= 3) {
            return response.data;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw (0, errorHandler_1.createAppError)('Code execution timeout', 408);
};
const getLanguageId = (language) => {
    const languageMap = {
        javascript: 63,
        python: 71,
        java: 62,
        cpp: 54,
        // Add more languages as needed
    };
    const id = languageMap[language.toLowerCase()];
    if (!id) {
        throw (0, errorHandler_1.createAppError)('Unsupported programming language', 400);
    }
    return id;
};
//# sourceMappingURL=codeExecutor.js.map