import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export const codeRunner = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return res
        .status(400)
        .json({ success: false, message: "Code and language are required" });
    }

    let command;
    let filePath = null;
    let classFilePath = null;
    console.log(language);
    switch (language) {
      case "javascript":
        command = `node -e "${code.replace(/"/g, '\\"')}"`;
        break;
      case "python":
        command = `python -c "${code.replace(/"/g, '\\"')}"`;
        break;
      case "java":
        // Save code to a temporary file for Java
        filePath = path.join(__dirname, "Main.java");
        classFilePath = path.join(__dirname, "Main.class");
        fs.writeFileSync(filePath, code);
        command = `javac ${filePath} && java -cp ${path.dirname(
          filePath
        )} Main`;
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Unsupported language" });
    }

    const { stdout, stderr } = await execAsync(command, { timeout: 10000 }); // Set a timeout to avoid hanging

    if (stderr) {
      return res
        .status(400)
        .json({ success: false, message: `Error: ${stderr}` });
    }

    // Clean up temporary Java files if used
    if (filePath) {
      fs.unlinkSync(filePath); // Remove Java source file
      if (fs.existsSync(classFilePath)) {
        fs.unlinkSync(classFilePath); // Remove Java compiled class file
      }
    }

    res.status(200).json({ success: true, output: stdout });
  } catch (error) {
    console.error("Error running code:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
