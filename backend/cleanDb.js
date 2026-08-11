const mongoose = require("mongoose");
require("dotenv").config();

// Replace with your MongoDB connection string if not using .env
const MONGO_URI = process.env.MONGO_URI 

async function clearDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for cleaning...");

    // Delete all collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
      console.log(`Cleared collection: ${collection.collectionName}`);
    }

    console.log("Database successfully wiped clean!");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
}

clearDatabase();