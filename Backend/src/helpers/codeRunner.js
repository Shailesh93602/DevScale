import axios from "axios";

const executeCode = async (language, code) => {
  const apiUrl = "https://api.jdoodle.com/v1/execute";
  const clientId = process.env.COMPILER_CLIENT_ID;
  const clientSecret = process.env.COMPILER_CLIENT_SECRET;

  const data = {
    script: code,
    language,
    versionIndex: language == "c++" ? "20" : "0",
    clientId,
    clientSecret,
  };
  try {
    const response = await axios.post(apiUrl, data);
    return response.data;
  } catch (error) {
    return { error: error.message };
  }
};

export default executeCode;
