import axios from "axios";

// TODO: remove the controller if not required in future versions
export const predict = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res
        .status(400)
        .json({ success: false, message: "Data is required" });
    }

    const apiEndpoint = "https://your-prediction-api.com/predict";

    const response = await axios.post(apiEndpoint, { data });

    if (response.status === 200) {
      return res.status(200).json({ success: true, prediction: response.data });
    } else {
      return res
        .status(response.status)
        .json({ success: false, message: response.statusText });
    }
  } catch (error) {
    console.error("Error making prediction:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
