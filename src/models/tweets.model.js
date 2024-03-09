import mongoose, { Schema } from "mongoose";

const tweetsSchema = new Schema(
  {
    owner: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
export const Tweets = mongoose.model("Tweets", tweetsSchema);
