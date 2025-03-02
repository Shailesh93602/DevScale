"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeRunner = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
exports.codeRunner = (0, utils_1.catchAsync)(async (req, res) => {
    const { code, language } = req.body;
    if (!code || !language) {
        return res
            .status(400)
            .json({ success: false, message: 'Code and language are required' });
    }
    let command;
    let filePath = null;
    let classFilePath = null;
    let binaryFilePath = null;
    switch (language) {
        case 'javascript':
            filePath = path_1.default.join(process.cwd(), 'main.js');
            fs_1.default.writeFileSync(filePath, code);
            command = `node ${filePath}`;
            break;
        case 'python':
            command = `python -c "${code.replace(/"/g, '\\"')}"`;
            break;
        case 'java':
            filePath = path_1.default.join(process.cwd(), 'Main.java');
            classFilePath = path_1.default.join(process.cwd(), 'Main.class');
            fs_1.default.writeFileSync(filePath, code);
            command = `javac ${filePath} && java -cp ${path_1.default.dirname(filePath)} Main`;
            break;
        case 'cpp':
            filePath = path_1.default.join(process.cwd(), 'main.cpp');
            binaryFilePath = path_1.default.join(process.cwd(), 'main');
            fs_1.default.writeFileSync(filePath, code);
            command = `g++ ${filePath} -o ${binaryFilePath} && ${binaryFilePath}`;
            break;
        case 'ruby':
            filePath = path_1.default.join(process.cwd(), 'main.rb');
            fs_1.default.writeFileSync(filePath, code);
            command = `ruby ${filePath}`;
            break;
        case 'go':
            filePath = path_1.default.join(process.cwd(), 'main.go');
            fs_1.default.writeFileSync(filePath, code);
            command = `go run ${filePath}`;
            break;
        case 'php':
            filePath = path_1.default.join(process.cwd(), 'main.php');
            fs_1.default.writeFileSync(filePath, code);
            command = `php ${filePath}`;
            break;
        case 'rust':
            filePath = path_1.default.join(process.cwd(), 'main.rs');
            binaryFilePath = path_1.default.join(process.cwd(), 'main');
            fs_1.default.writeFileSync(filePath, code);
            command = `rustc ${filePath} -o ${binaryFilePath} && ${binaryFilePath}`;
            break;
        case 'kotlin':
            filePath = path_1.default.join(process.cwd(), 'Main.kt');
            binaryFilePath = path_1.default.join(process.cwd(), 'Main');
            fs_1.default.writeFileSync(filePath, code);
            command = `kotlinc ${filePath} -include-runtime -d ${binaryFilePath}.jar && java -jar ${binaryFilePath}.jar`;
            break;
        default:
            return res
                .status(400)
                .json({ success: false, message: 'Unsupported language' });
    }
    const { stdout, stderr } = await execAsync(command, { timeout: 10000 });
    if (stderr) {
        return res.status(200).json({ success: false, output: stderr });
    }
    if (filePath) {
        fs_1.default.unlinkSync(filePath);
        if (classFilePath && fs_1.default.existsSync(classFilePath)) {
            fs_1.default.unlinkSync(classFilePath);
        }
        if (binaryFilePath && fs_1.default.existsSync(binaryFilePath)) {
            fs_1.default.unlinkSync(binaryFilePath);
        }
    }
    res.status(200).json({ success: true, output: stdout });
});
//# sourceMappingURL=codeRunnerController.js.map