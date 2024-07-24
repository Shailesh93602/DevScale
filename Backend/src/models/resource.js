import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
  ],
});

const Resource = mongoose.model("Resource", ResourceSchema);

export default Resource;
