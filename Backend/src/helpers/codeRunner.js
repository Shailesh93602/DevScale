import axios from "axios";

const executeCode = async (language, code) => {
  const apiUrl = "https://api.jdoodle.com/v1/execute";
  const clientId = "your-client-id";
  const clientSecret = "your-client-secret";

  const data = {
    script: code,
    language,
    versionIndex: "0",
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
