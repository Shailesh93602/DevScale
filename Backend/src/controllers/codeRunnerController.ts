import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';

const execAsync = promisify(exec);

export const codeRunner = catchAsync(async (req: Request, res: Response) => {
  const { code, language } = req.body;
  if (!code || !language) {
    return res
      .status(400)
      .json({ success: false, message: 'Code and language are required' });
  }

  let command: string;
  let filePath: string | null = null;
  let classFilePath: string | null = null;
  let binaryFilePath: string | null = null;

  switch (language) {
    case 'javascript':
      filePath = path.join(process.cwd(), 'main.js');
      fs.writeFileSync(filePath, code);
      command = `node ${filePath}`;
      break;
    case 'python':
      command = `python -c "${code.replace(/"/g, '\\"')}"`;
      break;
    case 'java':
      filePath = path.join(process.cwd(), 'Main.java');
      classFilePath = path.join(process.cwd(), 'Main.class');
      fs.writeFileSync(filePath, code);
      command = `javac ${filePath} && java -cp ${path.dirname(filePath)} Main`;
      break;
    case 'cpp':
      filePath = path.join(process.cwd(), 'main.cpp');
      binaryFilePath = path.join(process.cwd(), 'main');
      fs.writeFileSync(filePath, code);
      command = `g++ ${filePath} -o ${binaryFilePath} && ${binaryFilePath}`;
      break;
    case 'ruby':
      filePath = path.join(process.cwd(), 'main.rb');
      fs.writeFileSync(filePath, code);
      command = `ruby ${filePath}`;
      break;
    case 'go':
      filePath = path.join(process.cwd(), 'main.go');
      fs.writeFileSync(filePath, code);
      command = `go run ${filePath}`;
      break;
    case 'php':
      filePath = path.join(process.cwd(), 'main.php');
      fs.writeFileSync(filePath, code);
      command = `php ${filePath}`;
      break;
    case 'rust':
      filePath = path.join(process.cwd(), 'main.rs');
      binaryFilePath = path.join(process.cwd(), 'main');
      fs.writeFileSync(filePath, code);
      command = `rustc ${filePath} -o ${binaryFilePath} && ${binaryFilePath}`;
      break;
    case 'kotlin':
      filePath = path.join(process.cwd(), 'Main.kt');
      binaryFilePath = path.join(process.cwd(), 'Main');
      fs.writeFileSync(filePath, code);
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
    fs.unlinkSync(filePath);
    if (classFilePath && fs.existsSync(classFilePath)) {
      fs.unlinkSync(classFilePath);
    }
    if (binaryFilePath && fs.existsSync(binaryFilePath)) {
      fs.unlinkSync(binaryFilePath);
    }
  }

  res.status(200).json({ success: true, output: stdout });
});
