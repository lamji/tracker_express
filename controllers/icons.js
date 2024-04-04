/** @format */

const Icon = require("../models/icons");

module.exports.uploadIcon = async (icons) => {
  try {
    if (!icons || !Array.isArray(icons)) {
      return {
        status: 400,
        error: "Icons must be provided as an array of strings",
      };
    }

    const newIcon = new Icon({ icons });
    await newIcon.save();

    return {
      status: 201,
      message: "Icon uploaded successfully",
      icon: newIcon,
    };
  } catch (error) {
    console.error("Error uploading icon:", error);
    return { status: 500, error: "Internal server error" };
  }
};
