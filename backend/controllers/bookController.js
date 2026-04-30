const db = require("../config/db");

// ADD BOOK
exports.addBook = (req, res) => {
  const { title, author, isbn, total_copies } = req.body;

  const sql = `
    INSERT INTO books (title, author, isbn, total_copies, available_copies)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, author, isbn, total_copies, total_copies], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Book added", id: result.insertId });
  });
};

// GET ALL BOOKS
exports.getBooks = (req, res) => {
  db.query("SELECT * FROM books", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// BORROW BOOK
exports.borrowBook = (req, res) => {
  const { user_id, book_id } = req.body;

  // check availability
  const checkSql = "SELECT available_copies FROM books WHERE id=?";
  db.query(checkSql, [book_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result[0].available_copies <= 0) {
      return res.json({ message: "No copies available" });
    }

    // insert record
    const borrowSql = "INSERT INTO borrow_records (user_id, book_id) VALUES (?, ?)";
    db.query(borrowSql, [user_id, book_id]);

    // decrease count
    const updateSql = "UPDATE books SET available_copies = available_copies - 1 WHERE id=?";
    db.query(updateSql, [book_id]);

    res.json({ message: "Book borrowed" });
  });
};
exports.searchBooks = (req, res) => {
  const { keyword } = req.query;

  const sql = `
    SELECT * FROM books 
    WHERE title LIKE ? OR author LIKE ?
  `;

  db.query(sql, [`%${keyword}%`, `%${keyword}%`], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};
exports.returnBook = (req, res) => {
  const { user_id, book_id } = req.body;

  // find borrow record
  const findSql = `
    SELECT * FROM borrow_records 
    WHERE user_id=? AND book_id=? AND return_date IS NULL
  `;

  db.query(findSql, [user_id, book_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.json({ message: "No active borrow record found" });
    }

    // update return date
    const updateBorrow = `
      UPDATE borrow_records 
      SET return_date = NOW()
      WHERE id = ?
    `;

    db.query(updateBorrow, [result[0].id]);

    const today = new Date();
    const due = new Date(result[0].due_date);

    let fine = 0;

    if (today > due) {
    const daysLate = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
    fine = daysLate * 10; // ₹10 per day
    }

    // increase book copies
    const updateBook = `
      UPDATE books 
      SET available_copies = available_copies + 1 
      WHERE id = ?
    `;

    db.query(updateBook, [book_id]);

    res.json({ message: "Book returned successfully" });
  });
};