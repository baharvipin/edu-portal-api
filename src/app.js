const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const schoolRoutes = require("./routes/school.routes");
const superAdminRoutes = require("./routes/superadmin.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/superadmin", superAdminRoutes);

module.exports = app;
