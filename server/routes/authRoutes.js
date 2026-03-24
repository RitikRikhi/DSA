const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// REGISTER
router.post("/register", catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password required", 400));
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return next(new AppError("Admin already exists", 400));
  }

  const hash = await bcrypt.hash(password, 10);

  const admin = new Admin({
    email,
    password: hash
  });

  await admin.save();

  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, msg: "Admin Registered" });
}));

// LOGIN
router.post("/login", catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password required", 400));
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return next(new AppError("Invalid Email", 401));
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return next(new AppError("Invalid Password", 401));
  }

  const token = jwt.sign(
    { id: admin._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
}));

module.exports = router;