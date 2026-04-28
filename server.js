const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/books", require("./routes/bookRoutes"));


app.get("/", (req, res) => {
  res.send("Libro API Running with MySQL");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});