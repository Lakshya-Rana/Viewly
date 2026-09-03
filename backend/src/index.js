import { app, server } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./database/database.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 7000;

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });