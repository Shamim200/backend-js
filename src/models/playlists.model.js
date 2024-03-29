import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    video: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);
export const Playlists = mongoose.model("Playlists", playlistSchema);
