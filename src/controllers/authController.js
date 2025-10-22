const bcrypt =  require('bcryptjs') 
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const crypto = require('crypto');
const sendEmail = require('../utilities/sendEmail'); // implement this with nodemailer

const register = async(req, res ) => {
    try{
   const {firstName, lastName, role, email, password} = req.body
   const hashedPassword = await bcrypt.hash(password, 10)
   const code = crypto.randomInt(100000, 999999).toString();
   const newUser = new User({firstName, lastName, role: "super-admin", email, verificationCode: code, password: hashedPassword, verificationCodeExpires: Date.now() + 10 * 60 * 1000})
   await newUser.save()
   try {
  await sendEmail(email, code, "Your Verification Code", `Code: ${code}`);
} catch (emailErr) {
  console.error("Email send failed:", emailErr.message);
}

   res.status(201).json({message: "User registered successfully, Code sent", user: newUser}) 
   }catch(err){
        console.error(err); // Add this line
        res.status(500).json({message: "Internal server errors", error: err.message})
   }
}

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


module.exports = {
    register,
    login,
    verifyEmail,
    resendVerificationCode,
}