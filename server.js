const mongoose = require("mongoose");
const dotenv = require("dotenv");
process.on("uncaughtException", (error) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(error.name, error.message);
  process.exit(1);
});
dotenv.config({ path: "./config.env" });

const app = require("./app");

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_LOCAL)
  .then(() => console.log("Connected to MongoDB"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}...`));

process.on("unhandledRejection", (error) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.error(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});
