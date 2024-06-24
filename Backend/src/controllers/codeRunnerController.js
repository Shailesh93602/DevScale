import executeCode from "../helpers/codeRunner.js";

export const codeRunner = async (req, res) => {
  const { language, code } = req.body;

  let lang;
  switch (language) {
    case "javascript":
      lang = "nodejs";
      break;
    case "python":
      lang = "python3";
      break;
    case "java":
      lang = "java";
      break;
    case "cpp":
      lang = "cpp";
      break;
    default:
      return res.status(400).json({ error: "Unsupported language" });
  }

  const result = await executeCode(lang, code);
  res.json(result);
};
