/** @format */

const User = require("../models/user");
const auth = require("../auth");
const bcrypt = require("bcrypt");
const moment = require("moment/moment");

//function to catch & handle errors
const errCatcher = (err) => console.log(err);

/**
 * Login controller
 */
module.exports.login = async (params) => {
  try {
    // Find a user with matching email
    const user = await User.findOne({ email: params.email });

    // Check if user exists
    if (!user) {
      return { status: 401, error: "Invalid Credentials" };
    }

    // Check if password matches
    const isPasswordMatched = bcrypt.compareSync(
      params.password,
      user.password
    );

    // If password matches, create and return the access token
    if (isPasswordMatched) {
      const accessToken = auth.createAccessToken(user.toObject());
      return { accessToken };
    } else {
      // If password doesn't match, return error
      return { status: 401, error: "Invalid Credentials hot" };
    }
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error during login:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

// Get all active transaction
module.exports.getAllActive = ({ userId, queryParams }) => {
  // Create a query to find a user by their ID and exclude the password field
  const query = User.findById(userId).select("-password");

  function summarizeMonthlyIncome(transactions, type) {
    // Filter transactions by type 'Income'
    const incomeTransactions = transactions.filter(
      (transaction) => transaction.type === type
    );

    // Create an object to store monthly totals
    const monthlyIncomeSummary = {};

    // Iterate through income transactions and calculate monthly totals
    incomeTransactions.forEach((transaction) => {
      const date = moment(transaction.dateAdded);
      const monthYear = date.format("MMMM YYYY"); // Format: Month Year
      const monthCode = date.month() + 1; // Month codes are 1-based

      // Initialize or update the total for the month
      if (!monthlyIncomeSummary[monthYear]) {
        monthlyIncomeSummary[monthYear] = {
          month: monthYear,
          totalTransactions: 0,
          monthCode: monthCode,
        };
      }

      monthlyIncomeSummary[monthYear].totalTransactions += transaction.amount;
    });

    // Generate an array from the monthly summary object
    const summaryArray = Object.values(monthlyIncomeSummary);

    // Add missing months with zero total
    for (let i = 1; i <= 12; i++) {
      const monthYear = moment()
        .month(i - 1)
        .format("MMMM YYYY");
      if (!monthlyIncomeSummary[monthYear]) {
        summaryArray.push({
          month: monthYear,
          totalTransactions: 0,
          monthCode: i,
        });
      }
    }

    // Sort the array by month code (ascending)
    summaryArray.sort((a, b) => a.monthCode - b.monthCode);

    return summaryArray;
  }

  // Check if there are query parameters for filtering transactions
  if (queryParams && queryParams.category) {
    // If queryParams.category exists, populate the "transactions" field,
    // filtering by category and type
    query.populate({
      path: "transactions",
      match: {
        categoryName: queryParams.category,
        type: queryParams.type,
        // Use regex for partial matching (case insensitive)
        description: { $regex: new RegExp(queryParams.search, "i") },
        // filter by date
        dateAdded: queryParams.date,
      },
    });
  }

  // Execute the query and return a Promise
  return query.exec().then((resultFromFindById) => {
    // Filter the transactions based on the provided query parameters

    // If queryParams.category exists, filter transactions by category
    if (queryParams && queryParams.category) {
      resultFromFindById.transactions = resultFromFindById.transactions.filter(
        (transaction) => transaction.categoryName === queryParams.category
      );
    }

    // If queryParams.type exists, filter transactions by type
    if (queryParams && queryParams.type) {
      resultFromFindById.transactions = resultFromFindById.transactions.filter(
        (transaction) => transaction.type === queryParams.type
      );
    }

    // Search descriptions
    if (queryParams && queryParams.search) {
      const descriptionRegex = new RegExp(queryParams.search, "i"); // Case-insensitive regex
      resultFromFindById.transactions = resultFromFindById.transactions.filter(
        (transaction) => descriptionRegex.test(transaction.description)
      );
    }

    // filter by date
    if (queryParams && queryParams.date) {
      const requestedDate = moment(queryParams.date, "MM/DD/YYYY"); // Parse the requested date
      resultFromFindById.transactions = resultFromFindById.transactions.filter(
        (transaction) => {
          // Parse the transaction's dateAdded field
          const transactionDate = moment(transaction.dateAdded, "MM/DD/YYYY");

          // Compare the parsed dates for equality
          return requestedDate.isSame(transactionDate, "day");
        }
      );
    }

    // Sort transactions based on queryParams.sort (asc or desc)
    if (queryParams.sort === "desc") {
      resultFromFindById.transactions.sort((a, b) =>
        moment(b.dateAdded, "MM/DD/YYYY").diff(
          moment(a.dateAdded, "MM/DD/YYYY")
        )
      );
    } else {
      resultFromFindById.transactions.sort((a, b) =>
        moment(a.dateAdded, "MM/DD/YYYY").diff(
          moment(b.dateAdded, "MM/DD/YYYY")
        )
      );
    }

    const transactionList = resultFromFindById.transactions;

    /**
     * Get the monthly income
     */
    const monthlyIncomeSummary = summarizeMonthlyIncome(
      transactionList,
      "Income"
    );

    /**
     * Get the monthly expenses
     */
    const monthlyExpensesSummary = summarizeMonthlyIncome(
      transactionList,
      "Expenses"
    );

    // Return the result
    return {
      ...resultFromFindById?._doc,
      monthlyIncomeSummary: monthlyIncomeSummary,
      monthlyExpensesSummary: monthlyExpensesSummary,
    };
  });
};

/**
 * add transactions
 */
module.exports.addTransaction = async (params) => {
  try {
    const user = await User.findById(params.userId);
    if (user !== null) {
      //   console.log("params", params, user);
      // get the incomes
      const transactionIncome = user.transactions.filter(
        (transaction) => transaction.type === "Income"
      );

      //get the expenses
      const transactionExpenses = user.transactions.filter(
        (transaction) => transaction.type === "Expenses"
      );

      // get the total Income
      const balance = transactionIncome.reduce((acc, trans) => {
        return acc + trans.amount;
      }, 0);

      // get the total expenses
      const expenses = transactionExpenses.reduce((acc, trans) => {
        return acc + trans.amount;
      }, 0);

      //   // check if the category is already exist
      //   if (!user.categories.includes(params.transaction.categoryName)) {
      //     user.categories.push(params.transaction.categoryName);
      //   }

      // less the expenses in balance
      const totalBalance = parseFloat(balance) - parseFloat(expenses);

      if (params.transaction.type === "Income") {
        // Set the balance property of the user
        user.balance = totalBalance + parseFloat(params.transaction.amount);
        user.income = balance + parseFloat(params.transaction.amount);
      } else {
        // Set the balance property of the user
        user.balance = totalBalance - parseFloat(params.transaction.amount);
        user.expenses = expenses + parseFloat(params.transaction.amount);
      }

      user.transactions.push(params.transaction);

      await user.save();
      return { status: true, message: "Transaction added successfully", user };
    } else {
      return { status: false, message: "User not found" };
    }
  } catch (error) {
    return {
      status: false,
      message: error,
    };
  }
};

/**
 * Add category
 */
module.exports.addCategory = async (params) => {
  try {
    const user = await User.findById(params.userId);

    // Validation if category is existed
    function isCategoryNameExists(categories, categoryNameToCheck) {
      const lowerCaseCategoryNameToCheck = categoryNameToCheck.toLowerCase();
      return categories.some(
        (category) =>
          category.categoryName.toLowerCase() === lowerCaseCategoryNameToCheck
      );
    }

    if (user !== null) {
      if (isCategoryNameExists(user.categories, params.category.category)) {
        console.log("Category name already exists");
        return { status: false, message: "Category already exists" };
      } else {
        const data = {
          categoryName: params.category.category,
          totalBudget: params.category.amount,
        };
        user.categories.push(data);
        await user.save();
        console.log("Category added");
        return {
          status: true,
          message: "Category added successfully",
        };
      }
    } else {
      return { status: false, message: "Invalid Credentials" };
    }
  } catch (error) {
    return {
      status: false,
      message: error,
    };
  }
};
