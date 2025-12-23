const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.registerSchool = async (req, res) => {
  const { schoolName, board, adminName, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const school = await prisma.school.create({
    data: {
      name: schoolName,
      board,
      users: {
        create: {
          fullName: adminName,
          email,
          password: hashedPassword
        }
      }
    }
  });

  res.status(201).json({ message: "School registered", schoolId: school.id });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user.id, schoolId: user.schoolId },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
};
