const bcrypt =  require('bcryptjs') 
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const crypto = require('crypto');
const sendEmail = require('../utilities/sendEmail'); // implement this with nodemailer

const register = async (req, res) => {
  try {
    console.log("🟢 [REGISTER] Incoming registration request...");
    const { firstName, lastName, role, email, password } = req.body;

    console.log("📩 Email received:", email);
    console.log("🧍 Creating new user...");

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = crypto.randomInt(100000, 999999).toString();

    const newUser = new User({
      firstName,
      lastName,
      role,
      email,
      verificationCode: code,
      password: hashedPassword,
      verificationCodeExpires: Date.now() + 10 * 60 * 1000,
    });

    await newUser.save();
    console.log("✅ User saved to database:", newUser.email);

    // Logging before sending email
    console.log("📨 Attempting to send verification email...");
    try {
      await sendEmail(
        email,
        code,
        "Your Verification Code",
        `Your verification code is: ${code}`
      );
      console.log("✅ Verification email sent successfully to:", email);
    } catch (emailErr) {
      console.error("❌ Failed to send verification email:", emailErr.message);
      // Still respond successfully so user isn’t blocked
      return res.status(201).json({
        message:
          "User registered successfully, but verification email failed to send.",
        error: emailErr.message,
        user: newUser,
      });
    }

    // Logging after email success
    console.log("🎉 Registration process complete for:", email);

    res.status(201).json({
      message: "User registered successfully, code sent",
      user: newUser,
    });
  } catch (err) {
    console.error("❌ [REGISTER] Internal error:", err.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// POST /api/auth/register-admin - Admin creates user without email verification
const registerAdmin = async (req, res) => {
  try {
    console.log("🟢 [REGISTER-ADMIN] Incoming admin registration request...");
    const { firstName, lastName, role, email, password } = req.body;

    console.log("📩 Email received:", email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    console.log("🧍 Creating new user (admin-created)...");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      role,
      email,
      password: hashedPassword,
      isVerified: true, // Auto-verify admin-created users
      verificationCode: undefined, // No verification code needed
      verificationCodeExpires: undefined,
    });

    await newUser.save();
    console.log("✅ User saved to database (admin-created):", newUser.email);

    res.status(201).json({
      message: "User registered successfully by admin",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    });
  } catch (err) {
    console.error("❌ [REGISTER-ADMIN] Internal error:", err.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

const login = async (req, res ) => {  
    try{
    const {email, password} = req.body 
    const user = await User.findOne({email })
    if(!user){
        return res.status(404).json({message: "User not found"})
    }

    const isMatch = await bcrypt.compare(password, user.password) 
    if (!isMatch){
        return res.status(401).json({message: "Invalid credentials"}) 
    }

    const token =  jwt.sign({
        id: user._id,
        role: user.role 
    }, process.env.JWT_SECRET,{expiresIn: '1h' })

    res.status(200).json({message: "Login successful", token, user: {id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName}})
    }catch(err){
        res.status(500).json({message: "Internal server error", error: err.message})
    }
}
// POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  const { userId, code } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (
    user.verificationCode !== code ||
    !user.verificationCodeExpires ||
    user.verificationCodeExpires < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();
  res.status(200).json({ message: "Email verified" });
};


// POST /api/auth/resend-code
const resendVerificationCode = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const code = crypto.randomInt(100000, 999999).toString();
  user.verificationCode = code;
  user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
  await user.save();

  await sendEmail(user.email,code, "Resent Verification Code", `Code: ${code}`);
  res.status(200).json({ message: "Code resent" });
};

// GET /api/users - Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -verificationCode -verificationCodeExpires');
    res.status(200).json({ 
      message: "Users fetched successfully", 
      count: users.length,
      users 
    });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// GET /api/users/:id - Get single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -verificationCode -verificationCodeExpires');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ 
      message: "User fetched successfully", 
      user 
    });
  } catch (err) {
    console.error("Error fetching user:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// PATCH /api/users/:id - Update user information
// PATCH /api/users/:id - Update user information
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, isVerified, password } = req.body;

    console.log("🔄 [UPDATE USER] Request received for user ID:", id);
    console.log("📝 Update data:", { firstName, lastName, email, role, isVerified });

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      console.log("❌ User not found:", id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User found:", user.email);

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("❌ Email already in use:", email);
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = email;
      console.log("✅ Email updated to:", email);
    }

    // Update fields if provided
    if (firstName) {
      user.firstName = firstName;
      console.log("✅ First name updated to:", firstName);
    }
    if (lastName) {
      user.lastName = lastName;
      console.log("✅ Last name updated to:", lastName);
    }
    if (role) {
      user.role = role;
      console.log("✅ Role updated to:", role);
    }
    
    // Update verification status if provided
    if (typeof isVerified === 'boolean') {
      user.isVerified = isVerified;
      console.log("✅ Verification status updated to:", isVerified);
    }
    
    // Hash new password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      console.log("✅ Password updated");
    }

    await user.save();
    console.log("✅ User saved successfully");

    res.status(200).json({ 
      message: "User updated successfully", 
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    console.error("❌ [UPDATE USER] Error:", err.message);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// DELETE /api/users/:id - Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


module.exports = {
    register,
    login,
    verifyEmail,
    resendVerificationCode,
    registerAdmin,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
}