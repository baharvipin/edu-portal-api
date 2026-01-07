const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const schoolRoutes = require("./routes/school.routes");
const superAdminRoutes = require("./routes/superadmin.routes");
const  teacherRoutes = require("./routes/teacher.routes.js");
const subjectRoutes = require("./routes/subject.routes");
const classesRoutes = require("./routes/classes.routes.js")
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/teachers", teacherRoutes);

app.use("/api/subjects", subjectRoutes);
app.use("/api/classes", classesRoutes)
module.exports = app;