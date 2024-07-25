import axios from "axios";

export const predict = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res
        .status(400)
        .json({ success: false, message: "Data is required" });
    }

    // Replace with actual prediction API endpoint
    const apiEndpoint = "https://your-prediction-api.com/predict";

    // Send the request to the prediction API
    const response = await axios.post(apiEndpoint, { data });

    // Check if the response status is OK
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
