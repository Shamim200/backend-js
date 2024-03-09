import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_COMPASS}`);
    console.log(`MongoDB connected Successfully...`);
  } catch (error) {
    console.log("MongoDB connection Failed!!!", error);
  }
};

export default connectDB;
