const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (user) =>
    jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
});

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, department } = req.body;
        if (!name || !email || !password || !department) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "student",
            department,
        });

        return res.status(201).json({ user: publicUser(user), token: createToken(user) });
    } catch (error) {
        return next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email?.toLowerCase() });
        const validPassword = user && await bcrypt.compare(password || "", user.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        return res.json({ user: publicUser(user), token: createToken(user) });
    } catch (error) {
        return next(error);
    }
};

exports.getMe = async (req, res) => {
    res.json({ user: publicUser(req.user) });
};

exports.getCurrentUser = exports.getMe;
