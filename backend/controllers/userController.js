const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// CREATE USER
exports.createUser = (req, res) => {
  const { name, email, role } = req.body;

  const sql = "INSERT INTO users (name, email, role) VALUES (?, ?, ?)";
  db.query(sql, [name, email, role], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id: result.insertId, name, email, role });
  });
};

// GET ALL USERS
exports.getUsers = (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// UPDATE USER
exports.updateUser = (req, res) => {
  const { name, email, role } = req.body;
  const { id } = req.params;

  const sql = "UPDATE users SET name=?, email=?, role=? WHERE id=?";
  db.query(sql, [name, email, role, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User updated" });
  });
};

// DELETE USER
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM users WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User deleted" });
  });
};

// REGISTER USER
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  // ✅ Added role = "student"
  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, hashed, "student"], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User registered" });
  });
};

//LOG IN USER
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=?";
  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.json({ message: "User not found" });
    }

    const user = result[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, // include role also
      "secret",
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  });
};
