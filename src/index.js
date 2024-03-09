import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./config/db.js";
dotenv.config();

const port = process.env.PORT || 4001;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server is on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log(`server error`, error);
  });
