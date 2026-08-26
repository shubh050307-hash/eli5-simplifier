require('dotenv').config()

console.log('Loaded URI:', process.env.MONGODB_URI);

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

app.use(cors())
app.use(express.json());   
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
})

async function connectDB () {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}

connectDB();

app.get("/", (req, res) => {
  res.json({ status: 'ok' });

})