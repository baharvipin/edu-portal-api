const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = require("../src/config/db.js");

async function main() {
  const hashedPassword = await bcrypt.hash("SuperAdmin@123", 10);
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: "superadmin@eduportal.com" },
  });

  if (!existingAdmin) {
      await prisma.admin.create({
        data: {
          name: "System Admin",
          email: "superadmin@eduportal.com",
          password: hashedPassword,
          role: "SUPER_ADMIN",
           isActive: true,
           schoolId: null,
        },
      });
    console.log("✅ SuperAdmin created");
  } else {
    console.log("ℹ️ SuperAdmin already exists");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
