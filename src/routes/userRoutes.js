const express = require('express');
const verifyToken = require('../middleware/authMiddleware'); // Middleware to verify token
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


//only super-admin can access this route
router.get('/super-admin', verifyToken, authorizeRoles("super-admin"), (req,res)=>{
    console.log("Welcome to the Super Admin Dashboard");
    res.status(200).json({
        message: "Welcome to the Super Admin Dashboard"
    });
})

//Both admin and Super-admin can access this route
router.get('/admin', verifyToken, authorizeRoles("super-admin", "admin"),(req,res)=>{
    console.log("Welcome to the Admin Dashboard");
    res.status(200).json({
        message: "Welcome to the Admin Dashboard"
    });
}) 


//all can access this route 
router.get('/user', verifyToken,authorizeRoles("super-admin", "admin", "user"),(req,res)=>{
    console.log("Welcome to the user Dashboard");
    res.status(200).json({
        message: "Welcome to the user Dashboard"
    });
}) 

module.exports = router;