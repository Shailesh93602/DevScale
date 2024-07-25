// models/Resource.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ResourceSchema = new Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    subtopic: {
      type: String,
      required: false, // Made optional if not every resource has a subtopic
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      // Automatically update this field on document modification
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

export default mongoose.model("Resource", ResourceSchema);
