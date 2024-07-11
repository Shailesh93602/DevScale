import customAxios from "./customAxios";

export const fetchData = async (method, path, data = null) => {
  try {
    switch (method.toUpperCase()) {
      case "GET":
        return await customAxios.get(path);
      case "POST":
        return await customAxios.post(path, data);
      case "PUT":
        return await customAxios.put(path, data);
      default:
        throw new Error("Invalid method");
    }
  } catch (error) {
    return error;
  }
};
