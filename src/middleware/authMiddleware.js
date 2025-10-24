const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
 
const verifyToken = (req,res,next) =>{
    let token;
    let authHeader = req.headers.Authorization  || req.headers.authorization;

    if(authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({message: "No token provided, authorization denied"});
        }
        try{
             const decode = jwt.verify(token, process.env.JWT_SECRET);
             req.user = decode;
             console.log("The decoded user is ", req.user); 
             next();
        }catch(err){
            res.status(400 ).json({message: "Token is not valid"});
        }
    }else{
        return res.status(401).json({message: "Authorization header is missing or malformed"}); 
    } 
}
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('firstName lastName _id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      role: decoded.role // ⬅️ ADD THIS!
    };

    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};



module.exports = [verifyToken, authMiddleware];