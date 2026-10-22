/**
 * One-time admin user seeder.
 *
 * Run from the server/ directory:
 *   node scripts/createAdmin.js
 *
 * Override defaults with environment variables:
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_DEPARTMENT
 */
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function main() {
  const uri =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/college_event_management";

  console.log("Connecting to MongoDB…");
  await mongoose.connect(uri);

  const email      = process.env.ADMIN_EMAIL      || "admin@campus.edu";
  const password   = process.env.ADMIN_PASSWORD   || "Admin@1234";
  const name       = process.env.ADMIN_NAME       || "System Admin";
  const department = process.env.ADMIN_DEPARTMENT || "Administration";

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`✓ Updated ${email} role to admin.`);
    } else {
      console.log(`Admin already exists: ${email}`);
    }
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashedPassword, role: "admin", department });

  console.log(`✓ Admin user created`);
  console.log(`  Email   : ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Change the password after first login.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seeder failed:", err.message);
  process.exit(1);
});
