const mongoose = require('mongoose'); 

const userSchema = new mongoose.Schema({
     firstName: {
        type: String,
        required: true,
        
     },
     lastName: {
        type: String,
        required: true,
        
     },
     role: {
        type: String,
        required: true,
        enum: ['super-admin', 'operator', 'county', 'auditor'], // Example roles
        default: 'super-admin', // Default role
     },
     email: {
        type: String,
        required: true,
        unique: true,
     },
     password: {
        type: String,
        required: true,
     },
     verificationCode: {
      type: String,
      },
      isVerified: {
          type: Boolean, 
          default: false 
      },
      verificationCodeExpires: {type:Date},
     
     
},{
    timestamps: true, 
})
module.exports = mongoose.model('User', userSchema)