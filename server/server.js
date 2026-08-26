require('dotenv').config()


const express = require("express");
const simplifyRoutes = require('./routes/simplifyRoutes');
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

app.use(cors())
app.use(express.json()); 
app.use('/api', simplifyRoutes);  
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