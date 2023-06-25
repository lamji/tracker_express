/** @format */

const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "First name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  image: {
    type: String,
  },
  loginType: {
    type: String,
    required: [true, "Login type is required"],
  },
  EmailRecovery: {
    type: String,
  },
  password: {
    type: String,
  },
  balance: {
    type: Number,
    required: [true, "Balance is required"],
  },
  expenses: {
    type: Number,
    required: [true, "expenses is required"],
  },
  income: {
    type: Number,
  },
  categories: [],
  transactions: [
    {
      categoryName: {
        type: String,
        required: [true, "Category name is required."],
      },
      type: {
        // Income or Expense
        type: String,
        required: [true, "Category type is required."],
      },
      amount: {
        type: Number,
        required: [true, "Amount is required."],
      },
      description: {
        type: String,
        default: null,
      },
      balanceAfterTransaction: {
        type: Number,
        required: [true, "Balance is required."],
      },
      dateAdded: {
        type: Date,
        default: new Date(),
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
