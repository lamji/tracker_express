/** @format */

// controllers/categoryController.js
const Categories = require("../models/Category");

module.exports.uploadCategory = async (category) => {
  try {
    if (!category) {
      return { status: 400, error: "Category must be provided as an object" };
    }

    const newCategory = await Categories.create(category);
    return {
      status: 201,
      message: "Category uploaded successfully",
      category: newCategory,
    };
  } catch (error) {
    console.error("Error uploading category:", error);
    return { status: 500, error: "Internal server error" };
  }
};

module.exports.getAllCategories = async () => {
  try {
    const categories = await Categories.find();
    return { status: 200, categories };
  } catch (error) {
    console.error("Error retrieving categories:", error);
    return { status: 500, error: "Internal server error" };
  }
};

module.exports.updateCategory = async (categoryId, updatedCategoryData) => {
  try {
    const updatedCategory = await Categories.findByIdAndUpdate(
      categoryId,
      updatedCategoryData,
      { new: true }
    );
    if (!updatedCategory) {
      return { status: 404, error: "Category not found" };
    }
    return {
      status: 200,
      message: "Category updated successfully",
      category: updatedCategory,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return { status: 500, error: "Internal server error" };
  }
};

module.exports.deleteCategory = async (categoryId) => {
  try {
    const deletedCategory = await Categories.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return { status: 404, error: "Category not found" };
    }
    return {
      status: 200,
      message: "Category deleted successfully",
      category: deletedCategory,
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { status: 500, error: "Internal server error" };
  }
};
