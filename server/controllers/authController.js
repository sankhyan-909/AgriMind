const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
}

function safeUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profile: user.profile
  };
}

async function registerUser(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields."
      });
    }

    if (!["farmer", "buyer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: safeUser(user)
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account."
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: safeUser(user)
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login."
    });
  }
}

async function getCurrentUser(req, res) {
  const user = await User.findById(req.user.id).select(
    "-password"
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  return res.json({
    success: true,
    user: safeUser(user)
  });
}

async function updateProfile(req, res) {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    profile
  } = req.body;

  if (firstName !== undefined) user.firstName = firstName.trim();
  if (lastName !== undefined) user.lastName = lastName.trim();
  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.id },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "That email address is already in use.",
      });
    }

    user.email = normalizedEmail;
  }

  if (phone !== undefined) {
    user.phone = phone.trim();
  }

  user.name = `${user.firstName} ${user.lastName}`;

  if (profile && typeof profile === "object") {
    user.profile = {
      ...user.profile.toObject(),
      ...profile
    };
  }

  await user.save();

  return res.json({
    success: true,
    message: "Profile updated successfully.",
    user: safeUser(user)
  });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current and new passwords are required."
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must contain at least 6 characters."
    });
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  const valid = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!valid) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect."
    });
  }

  user.password = await bcrypt.hash(
    newPassword,
    10
  );

  await user.save();

  return res.json({
    success: true,
    message: "Password changed successfully."
  });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword
};
