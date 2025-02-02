import axios from 'axios';
import { COMPILER_CLIENT_ID, COMPILER_CLIENT_SECRET } from '../config';

const executeCode = async (language: string, code: string) => {
  const apiUrl = 'https://api.jdoodle.com/v1/execute';
  const clientId = COMPILER_CLIENT_ID;
  const clientSecret = COMPILER_CLIENT_SECRET;

  const data = {
    script: code,
    language,
    versionIndex: language == 'c++' ? '20' : '0',
    clientId,
    clientSecret,
  };
  try {
    const response = await axios.post(apiUrl, data);
    return response.data;
  } catch (error) {
    return { error: (error as { message: string }).message };
  }
};

export default executeCode;
