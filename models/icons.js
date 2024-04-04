/** @format */

const mongoose = require("mongoose");

const iconSchema = new mongoose.Schema({
  icons: {
    type: [String],
    required: true,
  },
});

const Icon = mongoose.model("Icon", iconSchema);

module.exports = Icon;
