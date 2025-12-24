require("dotenv").config(); // 👈 THIS LINE IS REQUIRED

const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
