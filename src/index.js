const express = require('express');
const dotenv = require('dotenv').config();
const dbConnect = require("./config/dbConnect")
const telemetryRoutes = require("./routes/telemetryRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const financeRoutes = require("./routes/financeRoutes");
const waterQualityRoutes = require("./routes/waterQualityRoutes");
const hygieneRoutes = require("./routes/hygieneRoutes");
const carbonRoutes = require("./routes/carbonRoutes");
const docsRoutes = require("./routes/docsRoutes");
const alertRoutes = require("./routes/alertRoutes");
const authRoutes = require("./routes/authRoutes");
const cors = require('cors');


dbConnect();

const app = express();

// ✅ Enable CORS (allow requests from frontend origin)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://dashboard.washlab.org',
    'http://localhost:3001',
    "https://admin.richworldsafaris.com",
    'https://www.richworldsafaris.com',
    'https://richworldsafaris.com'
  ],// change to actual domain in prod
  credentials: true // if you need cookies/auth headers
}));

//middleware
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Add this before your routes to debug
app.use((req, res, next) => {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw body:', req.body);
    
    // If it's text but should be JSON, try parsing it
    if (req.headers['content-type'] === 'text/plain' && typeof req.body === 'string') {
        try {
            req.body = JSON.parse(req.body);
            console.log('Parsed body:', req.body);
        } catch (e) {
            console.log('Failed to parse as JSON:', e.message);
        }
    }
    next();
});

//routes
app.use("/api", telemetryRoutes);
app.use("/api", ticketRoutes);
app.use("/api", financeRoutes);
app.use("/api", waterQualityRoutes);
app.use("/api", hygieneRoutes);
app.use("/api", carbonRoutes);
app.use("/api", docsRoutes);
app.use("/api", alertRoutes);
app.use("/api/auth", authRoutes);



// root test route
app.get('/', (req, res) => {
  res.send('API is running');
});


//start server

const PORT = process.env.PORT || 4001;

app.listen(PORT, "0.0.0.0",()=>{
    console.log(`Server is running on port ${PORT}`)
})