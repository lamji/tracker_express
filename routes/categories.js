/** @format */

// routes/categories.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

router.post("/upload", async (req, res) => {
  const { category } = req.body;

  try {
    const resultFromUpload = await categoryController.uploadCategory(category);
    return res.status(resultFromUpload.status).json(resultFromUpload);
  } catch (error) {
    console.error("Error uploading category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const resultFromGetAll = await categoryController.getAllCategories();
    return res.status(resultFromGetAll.status).json(resultFromGetAll);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  const updatedCategory = req.body;

  try {
    const resultFromUpdate = await categoryController.updateCategory(
      categoryId,
      updatedCategory
    );
    return res.status(resultFromUpdate.status).json(resultFromUpdate);
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const resultFromDelete = await categoryController.deleteCategory(
      categoryId
    );
    return res.status(resultFromDelete.status).json(resultFromDelete);
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
