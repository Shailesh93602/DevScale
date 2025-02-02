"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const executeCode = async (language, code) => {
    const apiUrl = 'https://api.jdoodle.com/v1/execute';
    const clientId = config_1.COMPILER_CLIENT_ID;
    const clientSecret = config_1.COMPILER_CLIENT_SECRET;
    const data = {
        script: code,
        language,
        versionIndex: language == 'c++' ? '20' : '0',
        clientId,
        clientSecret,
    };
    try {
        const response = await axios_1.default.post(apiUrl, data);
        return response.data;
    }
    catch (error) {
        return { error: error.message };
    }
};
exports.default = executeCode;
//# sourceMappingURL=codeRunner.js.map