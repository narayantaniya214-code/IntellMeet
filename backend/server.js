const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const PORT = 5000;

app.get("/", (req, res) => {
  res.send("IntellMeet Backend is Running 🚀");
});
app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello from IntellMeet Backend 🚀",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});