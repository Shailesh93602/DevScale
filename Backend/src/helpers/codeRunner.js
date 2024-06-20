import axios from "axios";

const executeCode = async (language, code) => {
  const apiUrl = "https://api.jdoodle.com/v1/execute";
  const clientId = process.env.COMPILER_CLIENT_ID;
  const clientSecret = process.env.COMPILER_CLIENT_SECRET;
  console.log(apiUrl, clientId, clientSecret);

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
    console.log(error);
    return { error: error.message };
  }
};

export default executeCode;
