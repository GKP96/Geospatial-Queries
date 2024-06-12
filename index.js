"use strict";
const express = require("express");
const mongoose = require("mongoose");
const MessageSchema = require("./model/MessageSchema");
const app = express();
app.use(express.json());

// const url =
//   "mongodb+srv://Gautama:Gaunik%401234@cluster1.txuuzz9.mongodb.net/MSMG?retryWrites=true&w=majority&appName=Cluster1";
const url = "mongodb://localhost:27017/Geographic";
mongoose.connect(url);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error: "));
db.once("open", function () {
  console.log("Database Connected successfully");
});

app.post("/save", async (req, res) => {
  try {
    const message = new MessageSchema({
      username: req.body.username,
      text: req.body.text,
      location: {
        type: "Point",
        coordinates: [req.body.longitude, req.body.latitude],
      },
    });
    await message.save();
    res.status(200).json({
      message: "Message saved successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
app.post("/findNearby", async (req, res) => {
    const { longitude, latitude, maxDistance } = req.body;
  
    if (typeof longitude !== 'number' || typeof latitude !== 'number' || typeof maxDistance !== 'number') {
      return res.status(400).json({
        message: "Invalid input data. 'longitude', 'latitude', and 'maxDistance' are required and must be numbers.",
        success: false,
      });
    }
  
    try {
      const messages = await MessageSchema.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [latitude, longitude],
            },
            $maxDistance: maxDistance,
          },
        },
      });
  
      return res.status(200).json({
        message: "Nearby messages fetched successfully",
        success: true,
        data: messages,
      });
    } catch (error) {
      console.error("Error fetching nearby messages:", error);
      return res.status(500).json({
        message: "Error fetching nearby messages",
        success: false,
      });
    }
  });

app.get("/save", (req, res) => {
  res.status(200).json({
    message: "Working properly",
  });
});
app.listen(5050, () => {
  console.log("Server is running on port 5050");
});
