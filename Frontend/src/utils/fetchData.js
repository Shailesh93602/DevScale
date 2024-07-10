import axios from "axios";

export const fetchData = async (method, path, data = null) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authorization token not found");
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://mrengineersapi.com";

  try {
    switch (method.toUpperCase()) {
      case "GET":
        return await axios.get(baseUrl + path, config);
      case "POST":
        return await axios.post(baseUrl + path, data, config);
      case "PUT":
        return await axios.put(baseUrl + path, data, config);
      default:
        throw new Error("Invalid method");
    }
  } catch (error) {
    return error;
  }
};
