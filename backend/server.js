const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", require("./routes/userRoutes"));

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "123") {
        res.json({ message: "Login successful" });
    } else {
        res.json({ message: "Invalid credentials" });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});