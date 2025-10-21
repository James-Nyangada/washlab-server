const axios = require("axios");
const TripBooking = require("../models/tripBooking");
require("dotenv").config();

// Access Token
const getAccessToken = async () => {
    try {
        const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            { headers: { Authorization: `Basic ${auth}` } }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Failed to get access token:", error.response?.data || error.message);
        throw new Error("Failed to generate access token");
    }
};

// Format Phone
const formatPhoneNumber = (phoneNumber) => {
    if (/^07\d{8}$/.test(phoneNumber)) {
        phoneNumber = phoneNumber.replace(/^0/, "254");
    }
    return phoneNumber;
};

// STK Push
const initiateSTKPush = async (req, res) => {
    try {
        const { phoneNumber, amount, bookingId } = req.body;
        const formattedPhone = formatPhoneNumber(phoneNumber);
        const accessToken = await getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
        const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");

        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: process.env.MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: formattedPhone,
                PartyB: process.env.MPESA_SHORTCODE,
                PhoneNumber: formattedPhone,
                CallBackURL: process.env.MPESA_CALLBACK_URL,
                AccountReference: `TripBooking-${bookingId}`,
                TransactionDesc: "Trip Booking Payment",
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        await TripBooking.findByIdAndUpdate(bookingId, {
            mpesaCheckoutRequestId: response.data.CheckoutRequestID
        });

        res.json(response.data);
    } catch (error) {
        console.error("M-Pesa STK Push Error:", error.response?.data || error.message);
        res.status(500).json({ error: "STK Push request failed" });
    }
};

// Handle Callback
const handleCallback = async (req, res) => {
    try {
        const callbackData = req.body;
        const { CheckoutRequestID, ResultCode, CallbackMetadata } = callbackData.Body.stkCallback;

        if (ResultCode === 0) {
            const mpesaReceiptNumber = CallbackMetadata.Item.find(i => i.Name === "MpesaReceiptNumber")?.Value;

            const booking = await TripBooking.findOneAndUpdate(
                { mpesaCheckoutRequestId: CheckoutRequestID },
                {
                    payment_status: "paid",
                    booking_status: "confirmed",
                    mpesaReceiptNumber,
                    lastPaymentCheck: new Date(),
                },
                { new: true }
            );

            if (!booking) return res.status(404).json({ error: "Booking not found" });

            console.log("✅ Payment success:", booking);
            return res.json({ message: "Payment successful", booking });
        } else {
            await TripBooking.findOneAndUpdate(
                { mpesaCheckoutRequestId: CheckoutRequestID },
                { booking_status: "cancelled" }
            );
            console.log("❌ Payment failed:", callbackData.Body.stkCallback.ResultDesc);
            return res.status(400).json({ error: "Payment failed" });
        }
    } catch (error) {
        console.error("❌ Error handling callback:", error.message);
        res.status(500).json({ error: "Callback processing failed" });
    }
};

// Check Payment
const checkPaymentStatus = async (req, res) => {
    try {
        const booking = await TripBooking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ error: "Booking not found" });
        res.json({ payment_status: booking.payment_status });
    } catch (error) {
        res.status(500).json({ error: "Error checking payment status" });
    }
};

module.exports = { initiateSTKPush, handleCallback, checkPaymentStatus };
