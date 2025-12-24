const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const schoolRoutes = require("./routes/school.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/school", schoolRoutes);
// Add this route for backward compatibility if needed
app.use("/api/schools", authRoutes);

module.exports = app;
