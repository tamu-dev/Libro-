const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");

const { addBook, getBooks, borrowBook, returnBook, searchBooks } = require("../controllers/bookController");

router.post("/", addBook);
router.get("/", getBooks);
router.post("/borrow", borrowBook);
router.post("/return", returnBook);
router.get("/search", searchBooks);
// Protect routes
router.post("/borrow", verifyToken, borrowBook);
router.post("/return", verifyToken, returnBook);

module.exports = router;