const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Product = require("../models/productModel");


// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_LOCAL)
  .then(() => console.log("Connected to MongoDB"));

//   Read Json File
const products = JSON.parse(fs.readFileSync(`${__dirname}/product.json`, "utf8"));


// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Product.insertMany(products);
    console.log("Data imported successfully");
  } catch (error) {
    console.error("Error importing data", error);
  }
  process.exit();
};

// DESTROY DATA FROM DB
const deleteData = async () => {
  try {
    await Product.deleteMany();
    console.log("Data destroyed successfully");
  } catch (error) {
    console.error("Error destroying data", error);
  }
  process.exit();
};

// Uncomment the function you want to run
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  console.log("Please provide a command --import or --destroy");
}
