/** @format */

const express = require("express");
const router = express.Router();
const iconController = require("../controllers/icons");
const Icon = require("../models/icons"); // Import the Icon model

router.post("/upload", async (req, res) => {
  const { icons } = req.body;

  // Check if the body has icons
  if (!icons || !Array.isArray(icons)) {
    return res
      .status(400)
      .json({ error: "Icons must be provided as an array of strings" });
  }

  try {
    const resultFromUpload = await iconController.uploadIcon(icons);

    // Check the status
    if (resultFromUpload.status === 400 || resultFromUpload.status === 500) {
      return res.status(resultFromUpload.status).json(resultFromUpload);
    }

    // if no issue return success message and icon
    return res.status(resultFromUpload.status).json(resultFromUpload);
  } catch (error) {
    console.error("Error uploading icons:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get all icons
router.get("/", async (req, res) => {
  try {
    const icons = await Icon.find();
    res.status(200).json(icons);
  } catch (error) {
    console.error("Error retrieving icons:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
